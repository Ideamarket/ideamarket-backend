import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import { getVoteCount, upVote, downVote } from '../services/vote.service'

export async function fetchVoteCount(req: Request, res: Response) {
  const { listing, market } = req.params

  try {
    const result = await getVoteCount(listing, market)
    console.log(result)
    return handleSuccess(res, result)
  } catch (error) {
    return handleError(res, error, 'Unable to fetch vote count')
  }
}

export async function upvote(req: Request, res: Response) {
  // TODO # EXTRACT USERID FROM JWT TOKEN
  const { listing, market, userId } = req.body

  try {
    const latestVoteCount = await upVote(listing, market, userId)
    return handleSuccess(res, latestVoteCount)
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`)
  }
}

export async function downvote(req: Request, res: Response) {
  // TODO # EXTRACT USERID FROM JWT TOKEN
  const { listing, market, userId } = req.body

  try {
    const latestVoteCount = await downVote(listing, market, userId)
    return handleSuccess(res, latestVoteCount)
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`)
  }
}
