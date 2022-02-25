import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAccessTokenForTwitter,
  fetchRequestTokenForTwitter,
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
    const requestToken = await fetchAccessTokenForTwitter({
      requestToken: reqBody.requestToken,
      oAuthVerifier: reqBody.oAuthVerifier,
    })

    return handleSuccess(res, {
      message: 'Access token has been generated',
      requestToken,
    })
  } catch (error) {
    console.error('Error occurred while fetching twitter access token', error)
    return handleError(res, error, 'Unable to fetch twitter access token')
  }
}

export async function postTweet(req: Request, res: Response) {
  try {
    const reqBody = req.body
    await postTweetOnBehalfOfUser({
      requestToken: reqBody.requestToken,
      text: reqBody.text,
    })

    return handleSuccess(res, { message: 'Tweet has been posted' })
  } catch (error) {
    console.error('Error occurred while posting tweet on behalf of user', error)
    return handleError(res, error, 'Unable to post tweet on behalf of user')
  }
}
