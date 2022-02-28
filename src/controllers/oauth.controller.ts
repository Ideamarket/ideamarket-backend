import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAccessTokenForTwitter,
  fetchRequestTokenForTwitter,
  fetchTwitterProfileByUsername,
  postTweetOnBehalfOfUser,
} from '../services/oauth.service'

export async function fetchTwitterRequestToken(req: Request, res: Response) {
  try {
    const requestToken = await fetchRequestTokenForTwitter()
    return handleSuccess(res, {
      message: 'Request token has been generated',
      requestToken,
    })
  } catch (error) {
    console.error('Error occurred while fetching twitter request token', error)
    return handleError(res, error, 'Unable to fetch twitter request token')
  }
}

export async function fetchTwitterAccessToken(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const response = await fetchAccessTokenForTwitter({
      requestToken: reqBody.requestToken,
      oAuthVerifier: reqBody.oAuthVerifier,
    })

    return handleSuccess(res, {
      message: 'Access token has been generated',
      ...response,
    })
  } catch (error) {
    console.error('Error occurred while fetching twitter access token', error)
    return handleError(res, error, 'Unable to fetch twitter access token')
  }
}

export async function postTweet(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const tweet = await postTweetOnBehalfOfUser({
      requestToken: reqBody.requestToken,
      text: reqBody.text,
    })

    return handleSuccess(res, { tweet })
  } catch (error) {
    console.error('Error occurred while posting tweet on behalf of user', error)
    return handleError(res, error, 'Unable to post tweet on behalf of user')
  }
}

export async function fetchTwitterProfile(req: Request, res: Response) {
  try {
    const twitterProfile = await fetchTwitterProfileByUsername(
      req.params.username
    )

    return handleSuccess(res, { twitterProfile })
  } catch (error) {
    console.error('Error occurred while fetching twitter access token', error)
    return handleError(res, error, 'Unable to fetch twitter access token')
  }
}
