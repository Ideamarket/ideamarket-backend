/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'
import config from 'config'
import request from 'request'
import util from 'util'

import { AccountModel } from '../models/account.model'
import type { ListingDocument } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import { TriggerModel, TriggerType } from '../models/trigger.model'
import {
  TwitterVerificationModel,
  TwitterVerificationType,
} from '../models/twitterVerification.model'
import type {
  Tweet,
  TwitterAuthorization,
  TwitterProfile,
  TwitterVerificationCompletion,
  TwitterVerificationInitiation,
} from '../types/twitterVerification.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { twitterAccessToken, twitterOAuth } from '../util/oauthUtil'
import { setTokenOwner, ZERO_ADDRESS } from '../util/web3Util'
import { markAccountVerifiedAndUpdateUsername } from './account.service'
import { InternalServerError } from './errors'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const twitterCallbackSuffix = config.get<string>('auth.twitter.callbackSuffix')
const twitterCallbackUrl = `${clientHostUrl}${twitterCallbackSuffix}`

export async function fetchTwitterProfileByUsername(
  username: string
): Promise<TwitterProfile> {
  const requestData = {
    url: `https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url,description`,
    method: 'GET',
  }
  const authHeader = twitterOAuth.toHeader(
    twitterOAuth.authorize(requestData, twitterAccessToken)
  )

  let response: any = null
  try {
    response = await axios.get(requestData.url, {
      headers: { Authorization: authHeader.Authorization },
    })
  } catch (error: any) {
    console.error(
      `Error occurred while fetching the twitter profile :: status=${
        error.response?.status
      }, data=${JSON.stringify(error.response?.data)}`
    )
    throw new InternalServerError('Failed to fetch the twitter profile')
  }

  return {
    id: response.data.data.id ?? null,
    username: response.data.data.username ?? null,
    name: response.data.data.name ?? null,
    bio: response.data.data.description ?? null,
    profileImageUrl: response.data.data.profile_image_url ?? null,
  }
}

export async function generateTwitterAuthorizationUrl({
  verificationType,
  listingId,
  decodedAccount,
}: {
  verificationType: TwitterVerificationType
  listingId: string | null
  decodedAccount: DECODED_ACCOUNT
}): Promise<TwitterAuthorization> {
  const isAlreadyVerified = await isAccountOrListingAlreadyVerified({
    verificationType,
    listingId,
    decodedAccount,
  })
  if (isAlreadyVerified) {
    return { alreadyVerified: isAlreadyVerified }
  }

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
    verificationType,
    requestToken,
    requestTokenSecret,
    accountId:
      verificationType === TwitterVerificationType.ACCOUNT
        ? decodedAccount.id
        : null,
    listingId:
      verificationType === TwitterVerificationType.LISTING ? listingId : null,
  })
  await TwitterVerificationModel.create(twitterVerificationDoc)

  return {
    alreadyVerified: false,
    authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`,
  }
}

async function isAccountOrListingAlreadyVerified({
  verificationType,
  listingId,
  decodedAccount,
}: {
  verificationType: TwitterVerificationType
  listingId: string | null
  decodedAccount: DECODED_ACCOUNT
}) {
  if (verificationType === TwitterVerificationType.ACCOUNT) {
    const account = await AccountModel.findById(decodedAccount.id)
    return account?.verified ?? false
  }

  const listing = await ListingModel.findById(listingId)
  return listing?.verified ?? false
}

export async function initiateTwitterVerification({
  requestToken,
  oAuthVerifier,
}: {
  requestToken: string
  oAuthVerifier: string
}): Promise<TwitterVerificationInitiation> {
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
  const redirectUrl =
    twitterVerificationDoc.verificationType === TwitterVerificationType.LISTING
      ? `${clientHostUrl}/i/${twitterVerificationDoc.listingId}`
      : `${clientHostUrl}/account`

  return {
    verificationInitiated: true,
    redirectUrl,
    requestToken,
    twitterUserId,
    twitterUsername,
  }
}

export async function completeTwitterVerification({
  requestToken,
  text,
  decodedAccount,
}: {
  requestToken: string
  text: string
  decodedAccount: DECODED_ACCOUNT
}): Promise<TwitterVerificationCompletion> {
  const twitterVerificationDoc = await TwitterVerificationModel.findOne({
    requestToken,
  })
  if (
    !twitterVerificationDoc ||
    !twitterVerificationDoc.accessToken ||
    !twitterVerificationDoc.accessTokenSecret
  ) {
    console.error('OAuth token data is missing')
    throw new InternalServerError('OAuth token data is not present')
  }
  const { verificationType, listingId, accessToken, accessTokenSecret } =
    twitterVerificationDoc
  const twitterUsername = twitterVerificationDoc.twitterUsername || null

  if (verificationType === TwitterVerificationType.LISTING && !listingId) {
    console.error('ListingId is necessary for LISTING verification type')
    throw new InternalServerError('Failed to complete twitter verification')
  }

  let listingDoc: ListingDocument | null = null
  if (verificationType === TwitterVerificationType.LISTING) {
    listingDoc = await ListingModel.findById(listingId)
  } else {
    listingDoc = await ListingModel.findOne({
      onchainValue: `@${twitterUsername?.toLowerCase()}`,
    })
  }
  const isListingVerified = listingDoc?.verified ?? false
  const marketId = listingDoc?.marketId ?? 0
  const tokenOwner = listingDoc?.onchainOwner ?? ZERO_ADDRESS
  const regex = /^@/u
  const tokenName = listingDoc?.onchainValue
    ? listingDoc.onchainValue.replace(regex, '')
    : null
  const tokenAddress = listingDoc?.onchainId ?? null

  const accountDoc = await AccountModel.findById(decodedAccount.id)
  const isAccountVerified = accountDoc?.verified ?? false
  const walletAddress = accountDoc?.walletAddress ?? null
  const imUsername = accountDoc?.username ?? null

  // Wallets do not match
  if (
    isListingVerified &&
    tokenOwner !== ZERO_ADDRESS &&
    walletAddress &&
    tokenOwner !== walletAddress
  ) {
    console.error('TokenOwner and walletAddress do not match')
    return {
      verificationCompleted: false,
      walletMismatch: true,
      mismatchData: { tokenOwner, walletAddress },
    }
  }

  // Usernames do not match
  if (
    isAccountVerified &&
    imUsername &&
    tokenName &&
    imUsername !== tokenName
  ) {
    console.error('TokenOwner and walletAddress do not match')
    return {
      verificationCompleted: false,
      usernameMismatch: true,
      mismatchData: { tokenName, username: imUsername },
    }
  }

  let tweet: Tweet | null = null
  if (!isAccountVerified && !isListingVerified) {
    const oAuthToken: OAuth.Token = {
      key: accessToken,
      secret: accessTokenSecret,
    }
    // Post the tweet
    tweet = await postTweet({ text, oAuthToken })
  }

  if (!isListingVerified) {
    if (!tokenAddress || !walletAddress) {
      console.error('TokenAddress or WalletAddress is null')
      throw new InternalServerError('Failed to set token owner - Missing data')
    }
    // Update token owner
    const isTokenOwnerUpdated = await setTokenOwner({
      tokenAddress,
      ownerAddress: walletAddress,
    })
    if (!isTokenOwnerUpdated) {
      throw new InternalServerError('Failed to set token owner')
    }
    await TriggerModel.create(
      TriggerModel.build({
        type: TriggerType.ONCHAIN_LISTING,
        triggerData: { marketId, tokenName: `@${tokenName}` },
      })
    )
  }

  if (!isAccountVerified) {
    // Mark account as verified
    await markAccountVerifiedAndUpdateUsername({
      accountId: decodedAccount.id,
      username: twitterUsername?.toLowerCase(),
    })
  }

  return { verificationCompleted: true, tweet }
}

async function postTweet({
  text,
  oAuthToken,
}: {
  text: string
  oAuthToken: OAuth.Token
}): Promise<Tweet> {
  const requestData = {
    url: 'https://api.twitter.com/2/tweets',
    method: 'POST',
  }
  const data = { text }
  const authHeader = twitterOAuth.toHeader(
    twitterOAuth.authorize(requestData, oAuthToken)
  )

  let response: any = null
  try {
    response = await axios.post(requestData.url, data, {
      headers: {
        Authorization: authHeader.Authorization,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
  } catch (error: any) {
    console.error(
      `Error occurred while posting the tweet :: status=${
        error.response?.status
      }, data=${JSON.stringify(error.response?.data)}`
    )
    throw new InternalServerError('Failed to post the tweet')
  }

  return {
    id: response.data.data.id ? (response.data.data.id as string) : null,
    text: response.data.data.text ? (response.data.data.text as string) : null,
  }
}
