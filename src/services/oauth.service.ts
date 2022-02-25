/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'
import config from 'config'
import request from 'request'
import util from 'util'

import { OAuthModel, OAuthPlatform } from '../models/oauth.model'
import { twitterOAuth } from '../util/oauthUtil'
import { InternalServerError } from './errors'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const twitterCallbackUrlSuffix = config.get<string>(
  'auth.twitter.callbackUrlSuffix'
)
const twitterCallbackUrl = `${clientHostUrl}${twitterCallbackUrlSuffix}`

export async function fetchRequestTokenForTwitter() {
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

  const oAuthDoc = OAuthModel.build({
    platform: OAuthPlatform.TWITTER,
    requestToken,
    requestTokenSecret,
  })
  await OAuthModel.create(oAuthDoc)

  return requestToken
}

export async function fetchAccessTokenForTwitter({
  requestToken,
  oAuthVerifier,
}: {
  requestToken: string
  oAuthVerifier: string
}) {
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

  if (!accessToken || !accessTokenSecret) {
    console.error(
      `Error occurred while fetching access token :: status=${statusCode}, body=${body}`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  await OAuthModel.findOneAndUpdate(
    {
      platform: OAuthPlatform.TWITTER,
      requestToken,
    },
    { $set: { accessToken, accessTokenSecret } }
  )

  return requestToken
}

export async function postTweetOnBehalfOfUser({
  requestToken,
  text,
}: {
  requestToken: string
  text: string
}) {
  const oAuthDoc = await OAuthModel.findOne({
    platform: OAuthPlatform.TWITTER,
    requestToken,
  })
  if (!oAuthDoc || !oAuthDoc.accessToken || !oAuthDoc.accessTokenSecret) {
    console.error('OAuth token data is missing')
    throw new InternalServerError('OAuth token data is not present')
  }

  const requestData = {
    url: 'https://api.twitter.com/2/tweets',
    method: 'POST',
  }
  const data = { text }
  const oAuthToken: OAuth.Token = {
    key: oAuthDoc.accessToken,
    secret: oAuthDoc.accessTokenSecret,
  }
  const authHeader = twitterOAuth.toHeader(
    twitterOAuth.authorize(requestData, oAuthToken)
  )

  try {
    await axios.post('https://api.twitter.com/2/tweets', data, {
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

  return null
}
