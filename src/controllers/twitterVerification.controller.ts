import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  completeTwitterVerification,
  initiateTwitterVerification,
  updateTwitterVerifiedProfiles,
} from '../services/twitterVerification.service'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

export async function initiateVerification(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const twitterVerification = await initiateTwitterVerification(
      decodedAccount
    )
    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while initiating twitter verification', error)
    return handleError(res, error, 'Unable to initiate twitter verification')
  }
}

export async function completeVerification(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const twitterVerification = await completeTwitterVerification({
      requestToken: reqBody.requestToken,
      oAuthVerifier: reqBody.oAuthVerifier,
    })

    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while completing twitter verification', error)
    return handleError(res, error, 'Unable to complete twitter verification')
  }
}

export async function updateTwitterVerifiedListings(_: Request, res: Response) {
  try {
    await updateTwitterVerifiedProfiles()

    return handleSuccess(res, {
      message: 'Old twitter verified listings have been updated',
    })
  } catch (error) {
    console.error(
      'Error occurred while updating twitter verified listings',
      error
    )
    return handleError(res, error, 'Unable to update twitter verified listings')
  }
}
