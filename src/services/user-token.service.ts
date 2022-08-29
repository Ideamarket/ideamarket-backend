/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import config from 'config'
import escapeStringRegexp from 'escape-string-regexp'
import type { UploadedFile } from 'express-fileupload'
import request from 'graphql-request'
import type { FilterQuery } from 'mongoose'
import type { PostOpinionsQueryOptions } from 'types/post.types'

import { AccountModel } from '../models/account.model'
import { EmailVerificationModel } from '../models/emailVerification.model'
import type { TriggerDocument } from '../models/trigger.model'
import { TriggerModel, TriggerType } from '../models/trigger.model'
import type {
  IUserRelation,
  MutualPostObject,
} from '../models/user-relation.model'
import { UserRelationModel } from '../models/user-relation.model'
import { UserRole, UserTokenModel } from '../models/user-token.model'
import type { IUserToken, UserTokenDocument } from '../models/user-token.model'
import type { IdeaToken, IdeaTokens } from '../types/subgraph.types'
import type {
  UserHoldersQueryOptions,
  UserHoldingsQueryOptions,
  UserRelationsQueryOptions,
  UserTokensQueryOptions,
} from '../types/user-token.types'
import { compareFn } from '../util'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { uploadFileToS3 } from '../util/mediaHandlerUtil'
import {
  getTokensByMarketIdAndTokenNameQuery,
  getTokensByMarketIdsQuery,
} from '../util/queries'
import { generateRandomNDigitNumber } from '../util/randomUtil'
import {
  checkUsernameCanBeUpdatedOrNot,
  getUserTokenPairs,
  mapUserTokenResponse,
  mapUserTokenResponseWithHoldingAmount,
  mapUserTokenResponseWithLatestTwitterUsername,
  sendMailForEmailVerification,
} from '../util/userTokenUtil'
import type { SignedWalletAddress } from '../util/web3Util'
import {
  recoverEthAddresses,
  SUBGRAPH_URL_V2,
  ZERO_ADDRESS,
  calculateClaimableIncome,
  calculateDayChange,
  calculateHolderAmount,
  calculateMarketCap,
  calculatePrice,
  calculateYearIncome,
} from '../util/web3Util'
import { getUserOpinionsSummary } from '../web3/opinions/nft-opinions'
import { EntityNotFoundError, InternalServerError } from './errors'
import { calculateWeekChange } from './listing.service'
import {
  fetchPostOpinionsByTokenIdFromWeb2,
  fetchPostOpinionsByWalletFromWeb2,
  getIdeamarketPostsContractAddress,
} from './post.service'

const s3Bucket: string = config.get('userToken.s3Bucket')
const cloudFrontDomain: string = config.get('userToken.cloudFrontDomain')
const userMarketId = config.get<number>('v2Markets.ids.userMarket')

export async function copyAccountsToUserToken() {
  const accounts = AccountModel.find()
  for await (const account of accounts) {
    console.log(`Copying account with id=${account._id.toString() as string}`)
    const userTokenDoc = UserTokenModel.build({
      walletAddress: account.walletAddress.toLowerCase(),
      name: (account.name as any) ?? null,
      email: (account.email as any) ?? null,
      bio: (account.bio as any) ?? null,
      profilePhoto: (account.profilePhoto as any) ?? null,
      role: account.role as string as UserRole,
      tokenAddress: null,
      marketId: 0,
      marketName: null,
      tokenOwner: ZERO_ADDRESS,
      holderTokens: [],
      price: 0,
      dayChange: 0,
      weekChange: 0,
      deposits: 0,
      holders: 0,
      yearIncome: 0,
      claimableIncome: 0,
      totalRatingsCount: 0,
      latestRatingsCount: 0,
    })
    if (account.username) {
      userTokenDoc.username = account.username
    }

    await UserTokenModel.create(userTokenDoc)
  }
}

export async function createUserToken(walletAddress: string) {
  let userToken: UserTokenDocument | null = null
  userToken = await UserTokenModel.findOne({ walletAddress })
  if (!userToken) {
    const userTokenDoc = UserTokenModel.build({
      walletAddress,
      name: null,
      email: null,
      bio: null,
      profilePhoto: null,
      role: UserRole.USER,
      tokenAddress: null,
      marketId: 0,
      marketName: null,
      tokenOwner: ZERO_ADDRESS,
      holderTokens: [],
      price: 0,
      dayChange: 0,
      weekChange: 0,
      deposits: 0,
      holders: 0,
      yearIncome: 0,
      claimableIncome: 0,
      totalRatingsCount: 0,
      latestRatingsCount: 0,
    })
    userToken = await UserTokenModel.create(userTokenDoc)
  }

  return mapUserTokenResponse(userToken)
}

export async function signInUserAndReturnToken(
  signedWalletAddress: SignedWalletAddress
) {
  let userToken: UserTokenDocument | null = null
  let userTokenCreated = false
  const walletAddress = recoverEthAddresses(signedWalletAddress).toLowerCase()

  userToken = await UserTokenModel.findOne({ walletAddress })
  if (!userToken) {
    const userTokenDoc = UserTokenModel.build({
      walletAddress,
      name: null,
      email: null,
      bio: null,
      profilePhoto: null,
      role: UserRole.USER,
      tokenAddress: null,
      marketId: 0,
      marketName: null,
      tokenOwner: ZERO_ADDRESS,
      holderTokens: [],
      price: 0,
      dayChange: 0,
      weekChange: 0,
      deposits: 0,
      holders: 0,
      yearIncome: 0,
      claimableIncome: 0,
      totalRatingsCount: 0,
      latestRatingsCount: 0,
    })
    userToken = await UserTokenModel.create(userTokenDoc)
    userTokenCreated = true
  }

  const { authToken, validUntil } = generateAuthToken(userToken._id.toString())
  if (!authToken) {
    throw new InternalServerError('Error occured while genrating auth token')
  }

  return {
    token: authToken,
    validUntil,
    userTokenCreated,
    ...mapUserTokenResponse(userToken),
  }
}

export async function updateUserTokenWeb2ProfileInDB(
  userTokenRequest: Partial<IUserToken>
) {
  const userTokenDoc = await UserTokenModel.findOne({
    walletAddress: userTokenRequest.walletAddress,
  })

  if (!userTokenDoc) {
    throw new EntityNotFoundError(null, 'UserToken do not exist')
  }

  userTokenDoc.name = userTokenRequest.name ?? userTokenDoc.name
  if (
    userTokenRequest.username &&
    userTokenRequest.username !== userTokenDoc.username
  ) {
    if (
      !(await checkUsernameCanBeUpdatedOrNot({
        currentUsername: userTokenDoc.username,
        usernameToBeChecked: userTokenRequest.username,
      }))
    ) {
      throw new InternalServerError('Username is already taken')
    }
    userTokenDoc.username = userTokenRequest.username
  }
  userTokenDoc.bio = userTokenRequest.bio ?? userTokenDoc.bio
  userTokenDoc.profilePhoto =
    userTokenRequest.profilePhoto ?? userTokenDoc.profilePhoto

  const updatedUserTokenDoc = await userTokenDoc.save()

  return mapUserTokenResponseWithLatestTwitterUsername(updatedUserTokenDoc)
}

export async function fetchUserTokenFromDB({
  userTokenId,
  username,
  walletAddress,
}: {
  userTokenId: string | null
  username: string | null
  walletAddress: string | null
}) {
  let userTokenDoc: UserTokenDocument | null = null

  if (userTokenId) {
    userTokenDoc = await UserTokenModel.findById(userTokenId)
  } else if (username) {
    userTokenDoc = await UserTokenModel.findOne({ username })
  } else if (walletAddress) {
    userTokenDoc = await UserTokenModel.findOne({ walletAddress })
  } else {
    userTokenDoc = null
  }

  if (!userTokenDoc) {
    return null
  }

  return mapUserTokenResponseWithLatestTwitterUsername(userTokenDoc)
}

export async function uploadProfilePhoto(profilePhoto: UploadedFile) {
  const fileName = await uploadFileToS3({
    file: profilePhoto,
    s3Bucket,
  })

  return fileName ? `${cloudFrontDomain}/${fileName}` : null
}

export async function sendEmailVerificationCode(email: string) {
  try {
    let sendVerificationCode = false
    const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

    if (
      !emailVerificationDoc ||
      !emailVerificationDoc.code ||
      !emailVerificationDoc.resendCodeTimestamp ||
      emailVerificationDoc.resendCodeTimestamp.getTime() < Date.now()
    ) {
      sendVerificationCode = true
    }

    if (sendVerificationCode) {
      const code = emailVerificationDoc?.code
        ? emailVerificationDoc.code
        : generateRandomNDigitNumber(6).toString()
      const latestResendCodeTimestamp = new Date(Date.now() + 60 * 1000)

      let updateRecord
      if (emailVerificationDoc) {
        emailVerificationDoc.code = code
        emailVerificationDoc.resendCodeTimestamp = latestResendCodeTimestamp
        updateRecord = emailVerificationDoc.save()
      }
      const addEmailVerificationDoc = EmailVerificationModel.build({
        email,
        code,
        resendCodeTimestamp: latestResendCodeTimestamp,
      })
      updateRecord = EmailVerificationModel.create(addEmailVerificationDoc)

      const sendMail = sendMailForEmailVerification({
        to: email,
        code,
      })
      await Promise.all([updateRecord, sendMail])
    }

    return
  } catch (error) {
    console.error('Error occurred while sending verification code', error)
    throw new InternalServerError(
      'Error occurred while sending verification code'
    )
  }
}

export async function checkEmailVerificationCode({
  walletAddress,
  email,
  code,
}: {
  walletAddress: string
  email: string
  code: string
}) {
  const response = {
    codeNotFound: false,
    emailVerified: true,
  }
  try {
    const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

    if (!emailVerificationDoc || !emailVerificationDoc.code) {
      response.codeNotFound = true
      return response
    }

    if (emailVerificationDoc.code !== code) {
      response.emailVerified = false
      return response
    }

    const updateUserToken = UserTokenModel.findOneAndUpdate(
      { walletAddress },
      { $set: { email } }
    )
    const clearEmailVerification = EmailVerificationModel.findOneAndDelete({
      email,
    })
    await Promise.all([updateUserToken, clearEmailVerification])

    return response
  } catch (error) {
    console.error('Error occurred while checking verification code', error)
    throw new InternalServerError(
      'Error occurred while checking verification code'
    )
  }
}

export async function fetchAllUserTokensFromWeb2(
  options: UserTokensQueryOptions
) {
  try {
    const { skip, limit, orderBy, search, filterWallets } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<UserTokenDocument>[] = []
    if (filterWallets.length > 0) {
      filterOptions.push({ walletAddress: { $in: filterWallets } })
    }
    if (search) {
      filterOptions.push({
        $or: [
          { name: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { bio: { $regex: escapeStringRegexp(search), $options: 'i' } },
          {
            walletAddress: {
              $regex: escapeStringRegexp(search),
              $options: 'i',
            },
          },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const userTokens = await UserTokenModel.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return userTokens.map((userToken) => mapUserTokenResponse(userToken))
  } catch (error) {
    console.error('Error occurred while fetching user tokens', error)
    throw new InternalServerError('Error occurred while fetching user tokens')
  }
}

export async function syncUserTokensInWeb2() {
  try {
    const allWeb3UserTokens = await fetchAllUserTokensFromWeb3()

    const totalWeb3UserTokens = allWeb3UserTokens.length
    if (totalWeb3UserTokens === 0) {
      throw new EntityNotFoundError(null, 'Got 0 user token from subgraph')
    }

    for await (const web3UserToken of allWeb3UserTokens) {
      await updateUserTokenInWeb2(web3UserToken)
    }

    return { totalWeb3UserTokens }
  } catch (error) {
    console.error(
      'Error occurred while copying user tokens from web3 to web2',
      error
    )
    throw new InternalServerError(
      'Error occurred while copying user tokens from web3 to web2'
    )
  }
}

export async function syncUserTokenInWeb2(walletAddress: string) {
  try {
    const web3UserTokens = await request(
      SUBGRAPH_URL_V2,
      getTokensByMarketIdAndTokenNameQuery({
        marketId: userMarketId,
        tokenName: walletAddress,
      })
    )

    if (
      web3UserTokens?.ideaMarkets?.length > 0 &&
      web3UserTokens.ideaMarkets[0].tokens.length > 0
    ) {
      const web3UserToken = web3UserTokens.ideaMarkets[0].tokens[0] as IdeaToken
      await updateUserTokenInWeb2(web3UserToken)
    } else {
      console.log(
        `Web3 usertoken data do not exist for the walletAddress - ${walletAddress}`
      )
    }
    return
  } catch (error) {
    console.error(
      'Error occurred while copying user tokens from web3 to web2',
      error
    )
    throw new InternalServerError(
      'Error occurred while copying user tokens from web3 to web2'
    )
  }
}

export async function fetchUserRelationsFromWeb2({
  userTokenId,
  username,
  walletAddress,
  options,
}: {
  userTokenId: string | null
  username: string | null
  walletAddress: string | null
  options: UserRelationsQueryOptions
}) {
  try {
    console.info('Fetching user token from the DB')
    let userTokenDoc: UserTokenDocument | null = null

    if (userTokenId) {
      userTokenDoc = await UserTokenModel.findById(userTokenId)
    } else if (username) {
      userTokenDoc = await UserTokenModel.findOne({ username })
    } else if (walletAddress) {
      userTokenDoc = await UserTokenModel.findOne({ walletAddress })
    } else {
      userTokenDoc = null
    }

    if (!userTokenDoc) {
      console.error('User token does not exist in the DB')
      throw new EntityNotFoundError(null, 'UserToken does not exist')
    }

    const userRelations = (await UserRelationModel.find({
      walletAddresses: { $all: [userTokenDoc.walletAddress] },
    })) as any

    const userRelationsWithUserTokens = []

    for await (const userRelation of userRelations) {
      const partnerWallet = userRelation.walletAddresses.find(
        (wallet: string) => wallet !== walletAddress
      )
      const partnerUserToken = await UserTokenModel.findOne({
        walletAddress: partnerWallet,
      })
      userRelationsWithUserTokens.push({
        userRelation,
        partnerUserToken: mapUserTokenResponse(partnerUserToken),
      })
    }

    const { skip, limit, orderBy, orderDirection } = options

    if (orderBy === 'matchScore') {
      return userRelationsWithUserTokens
        .sort((a: any, b: any) =>
          compareFn(a.userRelation, b.userRelation, orderBy, orderDirection)
        )
        .slice(skip, skip + limit)
    }

    return userRelationsWithUserTokens
      .sort((a: any, b: any) =>
        compareFn(
          a.partnerUserToken,
          b.partnerUserToken,
          orderBy,
          orderDirection
        )
      )
      .slice(skip, skip + limit)
  } catch (error) {
    console.error(
      'Error occurred while fetching user relations from web2',
      error
    )
    throw new InternalServerError('Failed to fetch user relations from web2')
  }
}

export async function syncUserRelationsForWallet({
  walletAddress,
  ratedPostID,
  rating,
}: {
  walletAddress: string
  ratedPostID: number
  rating: number
}) {
  try {
    const options: PostOpinionsQueryOptions = {
      latest: true,
      skip: 0,
      limit: 100_000,
      orderBy: 'rating',
      orderDirection: 'desc',
      search: '',
      filterTokens: [],
    }

    const contractAddress = getIdeamarketPostsContractAddress()

    const opinionsOfPost = await fetchPostOpinionsByTokenIdFromWeb2({
      contractAddress,
      tokenID: Number(ratedPostID),
      options,
    })

    // NOTE: filter out the input rater
    const ratersOfPost = opinionsOfPost.postOpinions
      .map((o) => o?.ratedBy)
      .filter((ratedBy) => ratedBy !== walletAddress)

    // If there was a new rating for this post, then every single UserRelation for this postID needs to be recalculated
    for await (const rater of ratersOfPost) {
      const userRelation = (await UserRelationModel.find({
        walletAddresses: { $all: [walletAddress, rater] },
      })) as any
      const filteredMutualRatedPosts =
        userRelation[0]?.mutualRatedPosts &&
        userRelation[0].mutualRatedPosts.length > 0
          ? userRelation[0].mutualRatedPosts.filter(
              (post: MutualPostObject) => post.postID !== ratedPostID
            )
          : []
      // Need rating of user that didn't have their rating change
      const unchangedRating = opinionsOfPost.postOpinions.find(
        (o) => o?.ratedBy === rater
      )?.rating as number
      // Calculate new mutual difference
      const updatedMutualDiff = Math.abs(unchangedRating - rating)
      // Add all past differences with new mutual difference
      const sumOfUnchangedDiffs =
        filteredMutualRatedPosts.length > 0
          ? (filteredMutualRatedPosts.reduce(
              (accumulator: number, object: MutualPostObject) => {
                return accumulator + object.mutualDifference
              },
              0
            ) as number)
          : 0

      const sumOfAllDiffs = sumOfUnchangedDiffs + updatedMutualDiff
      const diffAvg =
        sumOfAllDiffs / ((filteredMutualRatedPosts.length as number) + 1)
      const score = 100 - diffAvg

      // Update DB. 1) update matchScore. 2) update mutualRatedPosts
      if (userRelation && userRelation?.length > 0) {
        userRelation[0].matchScore = score
        userRelation[0].mutualRatedPosts = [
          ...filteredMutualRatedPosts,
          { postID: Number(ratedPostID), mutualDifference: updatedMutualDiff },
        ]

        await userRelation[0].save()
      } else {
        const userRelationDoc: IUserRelation = {
          walletAddresses: [walletAddress, rater as string],
          matchScore: score,
          mutualRatedPosts: [
            {
              postID: Number(ratedPostID),
              mutualDifference: updatedMutualDiff,
            },
          ],
        }

        await UserRelationModel.create(userRelationDoc)
      }
    }
  } catch (error) {
    console.error('Error occurred while syncing user relations', error)
    throw new InternalServerError('Error occurred while syncing user relations')
  }
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function syncAllUserRelationsInDB() {
  const ideamarketPostsContractAddress = getIdeamarketPostsContractAddress()
  const opinionOptions: PostOpinionsQueryOptions = {
    latest: true,
    skip: 0,
    limit: 100_000,
    orderBy: 'rating',
    orderDirection: 'desc',
    search: '',
    filterTokens: [],
  }

  const allUserTokens = await UserTokenModel.find()

  const allUserTokensWithOpinions = await Promise.all(
    allUserTokens.map(async (userToken: UserTokenDocument) => {
      let userOpinionsResponse = null
      if (userToken.totalRatingsCount > 0) {
        // This is most time consuming statement, so only do it if user has ratings
        userOpinionsResponse = await fetchPostOpinionsByWalletFromWeb2({
          contractAddress: ideamarketPostsContractAddress,
          walletAddress: userToken.walletAddress,
          options: opinionOptions,
        })
      }
      return {
        ...userToken.toObject(), // This method gets document variable. Otherwise, data doesn't come though
        userOpinions: userOpinionsResponse?.postOpinions ?? [],
      }
    })
  )

  const allUserTokenPairs = getUserTokenPairs(allUserTokensWithOpinions)
  for await (const userTokenPair of allUserTokenPairs) {
    const wallet1Opinions = userTokenPair.userTokens[0]?.userOpinions
    const wallet2Opinions = userTokenPair.userTokens[1]?.userOpinions
    // Get list of mutually rated posts for this user pair
    const mutualRatedPosts = []
    for (const wallet1Opinion of wallet1Opinions) {
      for (const wallet2Opinion of wallet2Opinions) {
        if (wallet1Opinion.tokenID === wallet2Opinion.tokenID) {
          const updatedMutualDiff = Math.abs(
            wallet1Opinion.rating - wallet2Opinion.rating
          )
          mutualRatedPosts.push({
            postID: wallet1Opinion.tokenID,
            mutualDifference: updatedMutualDiff,
          })
        }
      }
    }

    // Only update DB if there are mutualRatedPosts
    if (mutualRatedPosts.length > 0) {
      const sumOfDiffs =
        mutualRatedPosts.length > 0
          ? mutualRatedPosts.reduce(
              (accumulator: number, object: MutualPostObject) => {
                return accumulator + object.mutualDifference
              },
              0
            )
          : 0

      const diffAvg = sumOfDiffs / mutualRatedPosts.length
      const score = 100 - diffAvg

      const userRelation = (await UserRelationModel.find({
        walletAddresses: {
          $all: [
            userTokenPair.userTokens[0]?.walletAddress,
            userTokenPair.userTokens[1]?.walletAddress,
          ],
        },
      })) as any
      // Update DB. 1) update matchScore. 2) update mutualRatedPosts
      if (userRelation && userRelation?.length > 0) {
        userRelation[0].matchScore = score
        userRelation[0].mutualRatedPosts = [...mutualRatedPosts]

        await userRelation[0].save()
      } else {
        const userRelationDoc: IUserRelation = {
          walletAddresses: [
            userTokenPair.userTokens[0]?.walletAddress,
            userTokenPair.userTokens[1]?.walletAddress,
          ],
          matchScore: score,
          mutualRatedPosts: [...mutualRatedPosts],
        }

        await UserRelationModel.create(userRelationDoc)
      }
    }
  }
}

async function fetchAllUserTokensFromWeb3() {
  try {
    const allUserTokens: IdeaToken[] = []

    let index = 0
    let fetchedAll = false
    while (!fetchedAll) {
      const web3UserTokens: IdeaTokens = await request(
        SUBGRAPH_URL_V2,
        getTokensByMarketIdsQuery({
          marketIds: [userMarketId],
          skip: index * 100,
          limit: 100,
        })
      )
      allUserTokens.push(...web3UserTokens.ideaTokens)
      if (web3UserTokens.ideaTokens.length < 100) {
        fetchedAll = true
      }
      index += 1
    }

    console.log(`Total web3 user tokens found = ${allUserTokens.length}`)
    return allUserTokens
  } catch (error) {
    console.error(
      'Error occurred while fetching user tokens from subgraph',
      error
    )
    throw new InternalServerError('Failed to fetch user tokens from subgraph')
  }
}

export async function fetchUserHoldersFromWeb2({
  userTokenId,
  username,
  walletAddress,
  options,
}: {
  userTokenId: string | null
  username: string | null
  walletAddress: string | null
  options: UserHoldersQueryOptions
}) {
  try {
    console.info('Fetching user token from the DB')
    let userTokenDoc: UserTokenDocument | null = null

    if (userTokenId) {
      userTokenDoc = await UserTokenModel.findById(userTokenId)
    } else if (username) {
      userTokenDoc = await UserTokenModel.findOne({ username })
    } else if (walletAddress) {
      userTokenDoc = await UserTokenModel.findOne({ walletAddress })
    } else {
      userTokenDoc = null
    }

    if (!userTokenDoc) {
      console.error('User token does not exist in the DB')
      throw new EntityNotFoundError(null, 'UserToken does not exist')
    }

    console.info('Fetching holder token ids of the user')
    const holderTokens = userTokenDoc.holderTokens.map((holderToken) => ({
      amount: holderToken.amount,
      tokenId: holderToken.token._id.toString(),
    }))
    const holderTokenIds = holderTokens.map(
      (holderToken) => holderToken.tokenId
    )
    const holderTokensMap: Record<string, number> = {}
    for (const holderToken of holderTokens) {
      holderTokensMap[holderToken.tokenId] = holderToken.amount
    }

    console.info('Fetching holder tokens from the DB')
    const holders = await UserTokenModel.find({ _id: { $in: holderTokenIds } })
    const holdersWithHoldingAmounts: {
      userToken: UserTokenDocument
      holdingAmount: number
    }[] = []
    for (const holder of holders) {
      holdersWithHoldingAmounts.push({
        userToken: holder,
        holdingAmount: holderTokensMap[holder._id.toString()] || 0,
      })
    }
    const mappedHoldersWithHoldingAmounts = holdersWithHoldingAmounts.map(
      (holderWithHoldingAmounts) =>
        mapUserTokenResponseWithHoldingAmount(holderWithHoldingAmounts)
    )

    const { skip, limit, orderBy, orderDirection } = options
    return mappedHoldersWithHoldingAmounts
      .sort((a, b) => compareFn(a, b, orderBy, orderDirection))
      .slice(skip, skip + limit)
  } catch (error) {
    console.error('Error occurred while fetching user holders from web2', error)
    throw new InternalServerError('Failed to fetch user holders from web2')
  }
}

export async function fetchUserHoldingsFromWeb2({
  userTokenId,
  username,
  walletAddress,
  options,
}: {
  userTokenId: string | null
  username: string | null
  walletAddress: string | null
  options: UserHoldingsQueryOptions
}) {
  try {
    console.info('Fetching user token from the DB')
    let userTokenDoc: UserTokenDocument | null = null

    if (userTokenId) {
      userTokenDoc = await UserTokenModel.findById(userTokenId)
    } else if (username) {
      userTokenDoc = await UserTokenModel.findOne({ username })
    } else if (walletAddress) {
      userTokenDoc = await UserTokenModel.findOne({ walletAddress })
    } else {
      userTokenDoc = null
    }

    if (!userTokenDoc) {
      console.error('User token does not exist in the DB')
      throw new EntityNotFoundError(null, 'UserToken does not exist')
    }

    console.info('Fetching holdings token ids of the user')
    const holdings = await UserTokenModel.find({
      'holderTokens.token': userTokenDoc,
    }).populate({ path: 'holderTokens', populate: 'token' })

    const holdingsWithHoldingAmounts: {
      userToken: UserTokenDocument
      holdingAmount: number
    }[] = []
    for (const holding of holdings) {
      let holdingAmount = 0
      for (const holderToken of holding.holderTokens) {
        if (holderToken.token._id.toString() === userTokenDoc._id.toString()) {
          holdingAmount = holderToken.amount
          break
        }
      }
      holdingsWithHoldingAmounts.push({
        userToken: holding,
        holdingAmount,
      })
    }

    const mappedHoldingsWithHoldingAmounts = holdingsWithHoldingAmounts.map(
      (holdingWithHoldingAmounts) =>
        mapUserTokenResponseWithHoldingAmount(holdingWithHoldingAmounts)
    )

    const { skip, limit, orderBy, orderDirection } = options
    return mappedHoldingsWithHoldingAmounts
      .sort((a, b) => compareFn(a, b, orderBy, orderDirection))
      .slice(skip, skip + limit)
  } catch (error) {
    console.error(
      'Error occurred while fetching user holdings from web2',
      error
    )
    throw new InternalServerError('Failed to fetch user holdings from web2')
  }
}

async function updateUserTokenInWeb2(web3UserToken: IdeaToken) {
  try {
    const walletAddress = web3UserToken.name.toLowerCase()
    const userOpinionsSummary = await getUserOpinionsSummary(walletAddress)

    const holders = web3UserToken.balances.map((balance) => ({
      wallet: balance.holder,
      amount: balance.amount,
    }))
    const holderWallets = holders.map((holder) => holder.wallet)
    const holderWalletTokens = await UserTokenModel.find({
      walletAddress: { $in: holderWallets },
    })
    const holderTokensMap: Record<string, UserTokenDocument> = {}
    for (const holderWalletToken of holderWalletTokens) {
      holderTokensMap[holderWalletToken.walletAddress] = holderWalletToken
    }

    const holderTokens = []
    for (const holder of holders) {
      const amount = calculateHolderAmount(holder.amount)
      if (holder.wallet in holderTokensMap && amount > 0) {
        holderTokens.push({
          amount,
          token: holderTokensMap[holder.wallet],
        })
      }
    }

    const userToken = await UserTokenModel.findOne({ walletAddress })

    if (userToken) {
      userToken.tokenAddress = web3UserToken.id
      userToken.marketId = web3UserToken.market.id
      userToken.marketName = web3UserToken.market.name
      userToken.tokenOwner = web3UserToken.tokenOwner
      userToken.holderTokens = holderTokens
      userToken.price = calculatePrice(web3UserToken.latestPricePoint.price)
      userToken.dayChange = calculateDayChange(web3UserToken.dayChange)
      userToken.weekChange = calculateWeekChange(web3UserToken.pricePoints)
      userToken.deposits = calculateMarketCap(web3UserToken.marketCap)
      userToken.holders = web3UserToken.holders
      userToken.yearIncome = calculateYearIncome(web3UserToken.marketCap)
      userToken.claimableIncome = calculateClaimableIncome()
      userToken.totalRatingsCount = userOpinionsSummary.totalRatingsCount
      userToken.latestRatingsCount = userOpinionsSummary.latestRatingsCount

      return await userToken.save()
    }

    const userTokenDoc: IUserToken = {
      walletAddress: web3UserToken.name.toLowerCase(),
      name: null,
      email: null,
      bio: null,
      profilePhoto: null,
      role: UserRole.USER,
      tokenAddress: web3UserToken.id,
      marketId: web3UserToken.market.id,
      marketName: web3UserToken.market.name,
      tokenOwner: web3UserToken.tokenOwner,
      holderTokens: holderTokens.map((holderToken) => ({
        amount: holderToken.amount,
        token: holderToken.token._id.toString(),
      })),
      price: calculatePrice(web3UserToken.latestPricePoint.price),
      dayChange: calculateDayChange(web3UserToken.dayChange),
      weekChange: calculateWeekChange(web3UserToken.pricePoints),
      deposits: calculateMarketCap(web3UserToken.marketCap),
      holders: web3UserToken.holders,
      yearIncome: calculateYearIncome(web3UserToken.marketCap),
      claimableIncome: calculateClaimableIncome(),
      totalRatingsCount: userOpinionsSummary.totalRatingsCount,
      latestRatingsCount: userOpinionsSummary.latestRatingsCount,
    }

    return await UserTokenModel.create(userTokenDoc)
  } catch (error) {
    console.error('Error occurred while updating user tokens in DB', error)
    throw new InternalServerError('Failed to update user token in DB')
  }
}

export async function resolveUserTokenTrigger(trigger: TriggerDocument) {
  try {
    console.info(`Resolving trigger - ${trigger._id as string}`)

    const walletAddress = trigger.triggerData.walletAddress
      ? (trigger.triggerData.walletAddress as string)
      : null
    if (!walletAddress) {
      console.error(
        `TriggerData is not valid for type = ${TriggerType.USER_TOKEN}`
      )
      return
    }

    await syncUserTokenInWeb2(walletAddress)
    await TriggerModel.findByIdAndDelete(trigger._id)
    console.info(`Trigger - ${trigger._id as string} resolved`)
  } catch (error) {
    console.error('Error occurred while resolving user token trigger', error)
  }
}
