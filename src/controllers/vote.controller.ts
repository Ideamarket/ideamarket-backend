import type { Request, Response } from 'express'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import { getVoteCount, upVote, downVote } from '../services/vote.service'

export async function fetchVoteCount(req: Request, res: Response) {
  const { listingId } = req.params

  try {
    return handleSuccess(res, await getVoteCount(listingId))
  } catch (error) {
    return handleError(res, error, 'Unable to fetch vote count')
  }
}

export async function upvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listingId } = req.params

  try {
    return handleSuccess(res, await upVote(listingId, decodedAccount.id))
  } catch (error) {
    return handleError(res, error, `Unable to handle up vote`)
  }
}

export async function downvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listingId } = req.params

  try {
    return handleSuccess(res, await downVote(listingId, decodedAccount.id))
  } catch (error) {
    return handleError(res, error, `Unable to handle down vote`)
  }
}
