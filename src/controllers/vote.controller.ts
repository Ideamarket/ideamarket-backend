import type { Request, Response } from 'express'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import {
  getGhostListingVoteCount,
  upVoteGhostListing,
  downVoteGhostListing,
} from '../services/ghost.service'
import { getVoteCount, upVote, downVote } from '../services/vote.service'

export async function fetchVoteCount(req: Request, res: Response) {
  const { listing, market, marketType } = req.params

  try {
    let result = null

    if (marketType === 'ghost') {
      result = await getGhostListingVoteCount(listing, market)
    } else {
      result = await getVoteCount(listing, market)
    }

    return handleSuccess(res, result)
  } catch (error) {
    return handleError(res, error, 'Unable to fetch vote count')
  }
}

export async function upvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listing, market } = req.body
  const { marketType } = req.params

  try {
    let latestVoteCount = 0

    if (marketType === 'ghost') {
      latestVoteCount = await upVoteGhostListing(
        listing,
        market,
        decodedAccount.id
      )
    } else {
      latestVoteCount = await upVote(listing, market, decodedAccount.id)
    }

    return handleSuccess(res, latestVoteCount)
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`)
  }
}

export async function downvote(req: Request, res: Response) {
  const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
  const { listing, market } = req.body
  const { marketType } = req.params

  try {
    let latestVoteCount = 0

    if (marketType === 'ghost') {
      latestVoteCount = await downVoteGhostListing(
        listing,
        market,
        decodedAccount.id
      )
    } else {
      latestVoteCount = await downVote(listing, market, decodedAccount.id)
    }

    return handleSuccess(res, latestVoteCount)
  } catch (error) {
    return handleError(res, error, `Unable to handle create comment`)
  }
}
