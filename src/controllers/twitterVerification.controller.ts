import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { TwitterVerificationType } from '../models/twitterVerification.model'
import {
  completeTwitterVerification,
  fetchTwitterProfileByUsername,
  generateTwitterAuthorizationUrl,
  initiateTwitterVerification,
} from '../services/twitterVerification.service'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

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

export async function generateAuthorizationUrl(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const twitterAuthorization = await generateTwitterAuthorizationUrl({
      verificationType: reqBody.verificationType as TwitterVerificationType,
      listingId: reqBody.listingId ?? null,
      decodedAccount,
    })
    return handleSuccess(res, { twitterAuthorization })
  } catch (error) {
    console.error(
      'Error occurred while fetching twitter authorization url',
      error
    )
    return handleError(res, error, 'Unable to fetch twitter authorization url')
  }
}

export async function initiateVerification(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const twitterVerification = await initiateTwitterVerification({
      requestToken: reqBody.requestToken,
      oAuthVerifier: reqBody.oAuthVerifier,
    })

    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while initiating twitter verification', error)
    return handleError(res, error, 'Unable to initiate twitter verification')
  }
}

export async function completeVerification(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const twitterVerification = await completeTwitterVerification({
      requestToken: reqBody.requestToken,
      text: reqBody.text,
      decodedAccount,
    })

    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while completing twitter verification', error)
    return handleError(res, error, 'Unable to complete twitter verification')
  }
}
