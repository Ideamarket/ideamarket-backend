/* eslint-disable @typescript-eslint/restrict-template-expressions */
import config from 'config'
import request from 'request'
import Client from 'twitter-api-sdk'
import util from 'util'

import { ListingModel } from '../models/listing.model'
import { TwitterVerificationModel } from '../models/twitterVerification.model'
import { UserTokenModel } from '../models/user-token.model'
import type {
  TwitterVerificationInitiation,
  TwitterVerificationCompletion,
} from '../types/twitterVerification.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { twitterOAuth } from '../util/oauthUtil'
import { ZERO_ADDRESS } from '../util/web3Util'
import { InternalServerError } from './errors'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const twitterCallbackSuffix = config.get<string>('auth.twitter.callbackSuffix')
const twitterCallbackUrl = `${clientHostUrl}${twitterCallbackSuffix}`
const twitterBearerToken = config.get<string>('auth.twitter.bearerToken')

export async function fetchTwitterUsernameByUserId(userId: string | null) {
  if (!userId) {
    return null
  }

  try {
    const client = new Client(twitterBearerToken)
    const twitterUser = await client.users.findUserById(userId)
    return twitterUser.data?.username ?? null
  } catch (error) {
    console.error('Error occurred while fetching twitter username', error)
    return null
  }
}

export async function initiateTwitterVerification(
  decodedAccount: DECODED_ACCOUNT
): Promise<TwitterVerificationInitiation> {
  const requestData = {
    url: `https://api.twitter.com/oauth/request_token?oauth_callback=${twitterCallbackUrl}&x_auth_access_type=read`,
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
      `Error occurred while fetching request token :: status=${statusCode}, body=${body}`
    )
    throw new InternalServerError('Failed to fetch request token')
  }

  const results = new URLSearchParams(body)
  const requestToken = results.get('oauth_token')
  const requestTokenSecret = results.get('oauth_token_secret')
  const callbackConfirmed = results.get('oauth_callback_confirmed')

  if (!requestToken || !requestTokenSecret) {
    console.error(
      `Error occurred while fetching request token :: status=${statusCode}, body=${body}`
    )
    throw new InternalServerError('Failed to fetch request token')
  }
  if (callbackConfirmed !== 'true') {
    console.error(
      `Error occurred while fetching request token with confirmed callback :: status=${statusCode}, body=${body}`
    )
    throw new InternalServerError(
      'Failed to fetch request token with confirmed callback'
    )
  }

  const twitterVerificationDoc = TwitterVerificationModel.build({
    requestToken,
    requestTokenSecret,
    userTokenId: decodedAccount.id,
  })
  await TwitterVerificationModel.create(twitterVerificationDoc)

  return {
    authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`,
  }
}

export async function completeTwitterVerification({
  requestToken,
  oAuthVerifier,
}: {
  requestToken: string
  oAuthVerifier: string
}): Promise<TwitterVerificationCompletion> {
  const twitterVerificationDoc = await TwitterVerificationModel.findOne({
    requestToken,
  })
  if (!twitterVerificationDoc) {
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
      `Error occurred while fetching access token :: status=${statusCode}, body=${body}`
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
      `Error occurred while fetching access token :: status=${statusCode}, body=${body}`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  await TwitterVerificationModel.findOneAndUpdate(
    { requestToken },
    {
      $set: { accessToken, accessTokenSecret, twitterUserId, twitterUsername },
    }
  )
  await UserTokenModel.findByIdAndUpdate(twitterVerificationDoc.userTokenId, {
    $set: { twitterUsername, twitterUserId },
  })

  return {
    verificationCompleted: true,
  }
}

export async function updateTwitterVerifiedProfiles() {
  try {
    const twitterVerifiedListings = await ListingModel.find({
      marketId: 1,
      isOnchain: true,
      onchainOwner: { $ne: ZERO_ADDRESS },
    })
    console.log(
      `No. of twitter verified listings found = ${twitterVerifiedListings.length}`
    )
    for await (const listing of twitterVerifiedListings) {
      const walletAddress = listing.onchainOwner
      if (!walletAddress) {
        continue
      }
      const twitterUsername = listing.onchainValue.startsWith('@')
        ? listing.onchainValue.slice(1)
        : listing.onchainValue

      console.log(
        `Trying to update usertoken of walletAddress=${walletAddress} with twitterUsername=${twitterUsername}`
      )

      await UserTokenModel.findOneAndUpdate(
        { walletAddress },
        { $set: { twitterUsername } }
      )
    }
  } catch (error) {
    console.error('Error occurred while fetching twitter username', error)
    throw new InternalServerError('Failed to update twitter verified profiles')
  }
}
