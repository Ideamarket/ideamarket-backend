/* eslint-disable sonarjs/cognitive-complexity */
import config from 'config'
import type { FilterQuery } from 'mongoose'

import type { BountyDocument } from '../models/bounty-model'
import { BountyStatus, BountyModel } from '../models/bounty-model'
import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type { BountyQueryOptions } from '../types/bounty-types'
import {
  areBountiesInSameGroup,
  bountyOrderByCompareFn,
} from '../util/bountyUtil'
import { getAllBounties, getBountyAmountPayable } from '../web3/bounty'
import { web3 } from '../web3/contract'
import { getDeployedAddresses } from '../web3/deployedAddresses'
import { EntityNotFoundError, InternalServerError } from './errors'

const NETWORK = config.get<string>('web3.network')

export async function fetchAllBountiesFromWeb2({
  contractAddress: _contractAddress,
  options,
}: {
  contractAddress: string | null | undefined
  options: BountyQueryOptions
}) {
  const contractAddress =
    _contractAddress ?? getOpinionBountiesContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for opinion bounties')
    throw new InternalServerError(
      'Contract address is missing for opinion bounties '
    )
  }

  try {
    const {
      skip,
      limit,
      orderBy,
      orderDirection,
      tokenID,
      userTokenId,
      userAddress,
      username,
      depositorTokenId,
      depositorUsername,
      depositorAddress,
      filterStatuses,
      startDate,
      endDate,
    } = options

    // Filter Options
    const filterOptions: FilterQuery<BountyDocument>[] = []
    filterOptions.push({ contractAddress })

    if (tokenID) {
      filterOptions.push({ tokenID })
    }

    let userToken: UserTokenDocument | null = null
    if (userTokenId) {
      userToken = await UserTokenModel.findById(userTokenId)
    } else if (username) {
      userToken = await UserTokenModel.findOne({ username })
    } else if (userAddress) {
      userToken = await UserTokenModel.findOne({ walletAddress: userAddress })
    } else {
      userToken = null
    }
    if ((userTokenId || username || userAddress) && !userToken) {
      console.error('UserToken does not exist in the DB')
      throw new EntityNotFoundError('', 'UserToken does not exist')
    }

    if (userToken) {
      filterOptions.push({ userAddress })
    }

    let depositorToken: UserTokenDocument | null = null
    if (depositorTokenId) {
      depositorToken = await UserTokenModel.findById(depositorTokenId)
    } else if (depositorUsername) {
      depositorToken = await UserTokenModel.findOne({
        username: depositorUsername,
      })
    } else if (depositorAddress) {
      depositorToken = await UserTokenModel.findOne({
        walletAddress: depositorAddress,
      })
    } else {
      depositorToken = null
    }
    if (
      (depositorTokenId || depositorUsername || depositorAddress) &&
      !depositorToken
    ) {
      console.error('depositorToken does not exist in the DB')
      throw new EntityNotFoundError('', 'depositorToken does not exist')
    }

    if (depositorToken) {
      filterOptions.push({ depositorAddress })
    }

    if (filterStatuses.length > 0) {
      filterOptions.push({ status: { $in: filterStatuses } })
    }

    if (startDate && endDate) {
      filterOptions.push({ postedAt: { $gte: startDate, $lte: endDate } })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const bounties = await BountyModel.aggregate([
      {
        $lookup: {
          from: 'usertokens',
          localField: 'userAddress',
          foreignField: 'walletAddress',
          as: 'UserTokens',
        },
      },
      {
        $lookup: {
          from: 'usertokens',
          localField: 'depositorAddress',
          foreignField: 'walletAddress',
          as: 'DepositorTokens',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'tokenID',
          foreignField: 'tokenID',
          as: 'Posts',
        },
      },
      { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
      { $set: { depositorToken: { $arrayElemAt: ['$DepositorTokens', 0] } } },
      { $set: { post: { $arrayElemAt: ['$Posts', 0] } } },
      { $match: filterQuery },
    ])

    const groupBounties = [] as any

    for await (const bounty of bounties) {
      // if this bounty is already in group bounties, then don't add it again
      if (!groupBounties.some((b: any) => areBountiesInSameGroup(b, bounty))) {
        // Bounties that have this same tokenID, userAddress, and token are all in same group
        const group = bounties.filter((b: any) =>
          areBountiesInSameGroup(b, bounty)
        )

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const groupAmount = group.reduce((a, curr) => a + curr.amount, 0)

        const groupBounty = {
          contractAddress: group[0].contractAddress,
          bountyIDs: group.map((b: any) => b.bountyID),
          tokenID: group[0].tokenID,
          userToken: group[0].userToken,
          userAddress: group[0].userAddress,
          depositorTokens: group.map((b: any) => b.depositorToken),
          depositorAddresses: group.map((b: any) => b.depositorAddress),
          token: group[0].token,
          post: group[0].post,
          groupAmount,
          groupFunders: group.length,
          group,
        }

        groupBounties.push(groupBounty)
      }
    }

    return groupBounties
      .sort((a: any, b: any) =>
        bountyOrderByCompareFn(a, b, orderBy, orderDirection)
      )
      .slice(skip, skip + limit)
  } catch (error) {
    console.error(
      'Error occurred while fetching opinion bounties from web2',
      error
    )
    throw new InternalServerError('Failed to fetch opinion bounties from web2')
  }
}

export async function syncAllBountiesInWeb2() {
  const contractAddress = getOpinionBountiesContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for opinion bounties')
    throw new InternalServerError(
      'Contract address is missing for opinion bounties '
    )
  }

  console.log('Fetching all the bounties')
  const allWeb3Bounties = await getAllBounties()

  // Update all bounties that are returned from getAllBounties() -- once bounty is claimed, all its fields turn to 0, which sucks. Need to update those newly claimed bounties still too. Will do that after this loop
  for await (const bounty of allWeb3Bounties) {
    // If user is 0, then this bounty has been claimed and none of its data is useful anymore
    if (bounty.user !== '0x0000000000000000000000000000000000000000') {
      // console.log(`Syncing bounty with bountyID=${bounty.bountyID}`)
      const block = await web3.eth.getBlock(bounty.blockHeight)

      const bountyAmountPayable = await getBountyAmountPayable(
        bounty.tokenID,
        bounty.user.toLowerCase(),
        bounty.token
      )
      let status = null

      if (bounty.amount > 0 && Number.parseInt(bountyAmountPayable) === 0) {
        status = BountyStatus.OPEN
      } else {
        status = BountyStatus.CLAIMABLE
      }

      await updateBountyInWeb2({
        bounty: {
          bountyID: bounty.bountyID,
          tokenID: bounty.tokenID,
          userAddress: bounty.user.toLowerCase(),
          depositorAddress: bounty.depositor.toLowerCase(),
          token: bounty.token,
          amount: bounty.amount,
          status,
          timestamp: block.timestamp.toString(),
        },
        contractAddress,
      })
    }
  }

  const allDbBounties = await BountyModel.find()
  // If dbBounty is NOT in web3Bounties AND status is not already CLAIMED, it is newly claimed, so update it in DB. NOTE: first bounty does not work due to bountyID of 0 and all claimed bounties has bountyID of 0
  const newlyClaimedBounties = allDbBounties.filter(
    (dbBounty) =>
      dbBounty.status !== BountyStatus.CLAIMED &&
      !allWeb3Bounties.some(
        (web3Bounty) => web3Bounty.bountyID === dbBounty.bountyID
      )
  )

  for await (const newlyClaimedBounty of newlyClaimedBounties) {
    await updateBountyInWeb2({
      bounty: {
        bountyID: newlyClaimedBounty.bountyID,
        tokenID: newlyClaimedBounty.tokenID,
        userAddress: newlyClaimedBounty.userAddress,
        depositorAddress: newlyClaimedBounty.depositorAddress,
        token: newlyClaimedBounty.token,
        amount: newlyClaimedBounty.amount,
        status: BountyStatus.CLAIMED,
        timestamp: null,
      },
      contractAddress,
      postedAt: newlyClaimedBounty.postedAt,
    })
  }
}

// export async function syncBountyInWeb2(tokenID: number, userAddress: string, token: string) {
//   const contractAddress = getOpinionBountiesContractAddress()
//   if (!contractAddress) {
//     console.error('Deployed address is missing for opinion bounties')
//     throw new InternalServerError(
//       'Contract address is missing for opinion bounties '
//     )
//   }

//   console.log('Fetching the bounty')
//   const bounty = await getBounty(tokenID, userAddress, token)

//   console.log(`Syncing bounty with tokenID=${tokenID} userAddress=${userAddress} token=${token}`)
//   const block = await web3.eth.getBlock(bounty.blockHeight)
//   await updateBountyInWeb2({
//     bounty: {
//       bountyID: bounty.bountyID,
//       tokenID: bounty.tokenID,
//       user: bounty.user.toLowerCase(),
//       depositor: bounty.depositor.toLowerCase(),
//       token: bounty.token,
//       amount: bounty.amount,
//       status: bounty.status as BountyStatus,
//       timestamp: block.timestamp.toString(),
//     },
//     contractAddress,
//   })
// }

export async function updateBountyInWeb2({
  bounty,
  contractAddress,
  postedAt,
}: {
  bounty: any
  contractAddress: string
  postedAt?: Date
}) {
  const updatedPostedAt = bounty.timestamp
    ? new Date(Number.parseInt(bounty.timestamp) * 1000)
    : postedAt

  // console.log(`Fetching user token with walletAddress=${bounty.userAddress}`)
  // const userToken = await UserTokenModel.findOne({ walletAddress: bounty.userAddress })

  // console.log(`Fetching depositor token with walletAddress=${bounty.userAddress}`)
  // const depositorToken = await UserTokenModel.findOne({
  //   walletAddress: bounty.depositorAddress,
  // })

  // console.log(`Updating bounty for bountyID=${bounty.bountyID} in web2`)
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const updatedBounty = await BountyModel.findOneAndUpdate(
    {
      bountyID: bounty.bountyID,
    },
    {
      $set: {
        contractAddress,
        bountyID: bounty.bountyID,
        tokenID: bounty.tokenID,
        userAddress: bounty.userAddress,
        depositorAddress: bounty.depositorAddress,
        token: bounty.token,
        amount: bounty.amount,
        status: bounty.status,
        postedAt: updatedPostedAt,
      },
    },
    { upsert: true, new: true }
  )

  return updatedBounty
}

export function getOpinionBountiesContractAddress() {
  const opinionBountiesBaseDeployedAddress =
    getDeployedAddresses(NETWORK)?.nftOpinionBounties

  return opinionBountiesBaseDeployedAddress
    ? opinionBountiesBaseDeployedAddress.toLowerCase()
    : undefined
}
