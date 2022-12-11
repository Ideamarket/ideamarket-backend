import config from 'config'
import escapeStringRegexp from 'escape-string-regexp'
import type { FilterQuery } from 'mongoose'
import request from 'request'
import util from 'util'

import { TwitterUserTokenModel } from '../models/twitter-user-token.model'
import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import type {
  TwitterLoginCompletion,
  TwitterLoginInitiation,
  TwitterUserTokensQueryOptions,
} from '../types/twitter-user-token.types'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { twitterOAuth } from '../util/oauthUtil'
import { mapTwitterUserTokenResponse } from '../util/twitterUserTokenUtil'
// import { getUserOpinionsSummary } from '../web3/opinions/nft-opinions'
import { InternalServerError } from './errors'
// import {
//   fetchPostOpinionsByTokenIdFromWeb2,
//   fetchPostOpinionsByWalletFromWeb2,
// } from './post.service'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const twitterCallbackUrl = `${clientHostUrl}`

export async function initiateTwitterLoginDB(): Promise<TwitterLoginInitiation> {
  const requestData = {
    url: `https://api.twitter.com/oauth/request_token?oauth_callback=${twitterCallbackUrl}`,
    method: 'POST',
  }

  const response = await requestPromise({
    url: requestData.url,
    method: requestData.method,
    form: twitterOAuth.authorize(requestData),
  })

  const { statusCode, body } = response
  if (statusCode !== 200) {
    console.error(
      `Error occurred while fetching request token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch request token')
  }

  const results = new URLSearchParams(body)
  const requestToken = results.get('oauth_token')
  const requestTokenSecret = results.get('oauth_token_secret')
  const callbackConfirmed = results.get('oauth_callback_confirmed')

  if (!requestToken || !requestTokenSecret) {
    console.error(
      `Error occurred while fetching request token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch request token')
  }
  if (callbackConfirmed !== 'true') {
    console.error(
      `Error occurred while fetching request token with confirmed callback :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError(
      'Failed to fetch request token with confirmed callback'
    )
  }

  const twitterUserTokenDoc = TwitterUserTokenModel.build({
    requestToken,
    requestTokenSecret,
  })
  await TwitterUserTokenModel.create(twitterUserTokenDoc)

  return {
    authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`,
  }
}

export async function completeTwitterLoginDB({
  requestToken,
  oAuthVerifier,
}: {
  requestToken: string
  oAuthVerifier: string
}): Promise<TwitterLoginCompletion> {
  const twitterUserTokenDoc = await TwitterUserTokenModel.findOne({
    requestToken,
  })
  if (!twitterUserTokenDoc) {
    console.error('Twitter Verification Doc not found')
    throw new InternalServerError('Failed to fetch twitter verification doc')
  }

  const requestData = {
    url: `https://api.twitter.com/oauth/access_token?oauth_token=${requestToken}&oauth_verifier=${oAuthVerifier}`,
    method: 'POST',
  }
  const response = await requestPromise({
    url: requestData.url,
    method: requestData.method,
    form: twitterOAuth.authorize(requestData),
  })

  const { statusCode, body } = response
  if (statusCode !== 200) {
    console.error(
      `Error occurred while fetching access token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  const results = new URLSearchParams(body)
  const accessToken = results.get('oauth_token')
  const accessTokenSecret = results.get('oauth_token_secret')
  const twitterUserId = results.get('user_id')
  const twitterUsername = results.get('screen_name')

  if (!accessToken || !accessTokenSecret) {
    console.error(
      `Error occurred while fetching access token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  const updatedTwitterUserTokenDoc =
    await TwitterUserTokenModel.findOneAndUpdate(
      { _id: twitterUserTokenDoc._id },
      {
        $set: {
          accessToken,
          accessTokenSecret,
          twitterUserId,
          twitterUsername,
        },
      },
      { new: true }
    )

  const { authToken, validUntil } = generateAuthToken(
    twitterUserTokenDoc._id.toString()
  )
  if (!authToken) {
    throw new InternalServerError('Error occured while generating auth token')
  }

  return {
    twitterJwt: authToken,
    validUntil,
    // userTokenCreated,
    twitterUserToken: mapTwitterUserTokenResponse(updatedTwitterUserTokenDoc),
  }
}

export async function fetchTwitterUserTokenFromDB({
  twitterUserTokenId,
  twitterUsername,
}: {
  twitterUserTokenId: string | null
  twitterUsername: string | null
}) {
  let userTokenDoc: TwitterUserTokenDocument | null = null

  if (twitterUserTokenId) {
    userTokenDoc = await TwitterUserTokenModel.findById(twitterUserTokenId)
  } else if (twitterUsername) {
    userTokenDoc = await TwitterUserTokenModel.findOne({ twitterUsername })
  } else {
    userTokenDoc = null
  }

  if (!userTokenDoc) {
    return null
  }

  return mapTwitterUserTokenResponse(userTokenDoc)
}

export async function fetchAllTwitterUserTokensFromWeb2(
  options: TwitterUserTokensQueryOptions
) {
  try {
    const { skip, limit, orderBy, search, filterWallets } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<TwitterUserTokenDocument>[] = []
    if (filterWallets.length > 0) {
      filterOptions.push({ twitterUsername: { $in: filterWallets } })
    }
    if (search) {
      filterOptions.push({
        $or: [
          { name: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
          { bio: { $regex: escapeStringRegexp(search), $options: 'i' } },
          {
            twitterUsername: {
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

    const twitterUserTokens = await TwitterUserTokenModel.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return twitterUserTokens.map((twitterUserToken) =>
      mapTwitterUserTokenResponse(twitterUserToken)
    )
  } catch (error) {
    console.error('Error occurred while fetching user tokens', error)
    throw new InternalServerError('Error occurred while fetching user tokens')
  }
}

// async function updateUserTokenInWeb2(twitterUserToken: TwitterUserTokenRequest) {
//   try {
//     const twitterUsername = twitterUserToken.twitterUsername.toLowerCase()
//     const userOpinionsSummary = await getUserOpinionsSummary(twitterUsername)

//     const userToken = await TwitterUserTokenModel.findOne({ twitterUsername })

//     if (userToken) {
//       return userToken
//     }

//     const userTokenDoc: ITwitterUserToken = {
//       twitterUsername: twitterUserToken.twitterUsername.toLowerCase(),
//     }

//     return await TwitterUserTokenModel.create(userTokenDoc)
//   } catch (error) {
//     console.error('Error occurred while updating user tokens in DB', error)
//     throw new InternalServerError('Failed to update user token in DB')
//   }
// }
