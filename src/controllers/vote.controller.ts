import type { Request, Response } from 'express'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import { getVoteCount, upVote, downVote } from '../services/vote.service'

export async function fetchVoteCount(req: Request, res: Response) {
  const { listing, market, marketType } = req.params

  try {
    return handleSuccess(res, await getVoteCount(marketType, listing, market))
  } catch (error) {
    return handleError(res, error, 'Unable to fetch vote count')
  }
}

export async function upvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listing, market } = req.body
  const { marketType } = req.params

  try {
    return handleSuccess(
      res,
      await upVote(marketType, listing, market, decodedAccount.id)
    )
  } catch (error) {
    return handleError(res, error, `Unable to handle up vote`)
  }
}

export async function downvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listing, market } = req.body
  const { marketType } = req.params

  try {
    return handleSuccess(
      res,
      await downVote(marketType, listing, market, decodedAccount.id)
    )
  } catch (error) {
    return handleError(res, error, `Unable to handle down vote`)
  }
}
