import type { Request, Response } from 'express'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import {
  getVoteCount,
  removeUpVote,
  removeDownVote,
  addUpVote,
  addDownVote,
} from '../services/vote.service'

export async function fetchVoteCount(req: Request, res: Response) {
  try {
    const listingId = req.query.listingId as string
    const totalVotes = await getVoteCount(listingId)
    return handleSuccess(res, { totalVotes })
  } catch (error) {
    console.error('Error occured while fetching vote count', error)
    return handleError(res, error, 'Unable to fetch vote count')
  }
}

export async function upVote(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const totalVotes = await addUpVote({
      listingId: reqBody.listingId,
      accountId: decodedAccount.id,
    })

    return handleSuccess(res, { upVoted: true, totalVotes })
  } catch (error) {
    console.error('Error occured while up voting the listing', error)
    return handleError(res, error, 'Unable to upVote the listing')
  }
}

export async function deleteUpVote(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const totalVotes = await removeUpVote({
      listingId: reqBody.listingId,
      accountId: decodedAccount.id,
    })

    return handleSuccess(res, { upVoteDeleted: true, totalVotes })
  } catch (error) {
    console.error('Error occured while deleting upVote of the listing', error)
    return handleError(res, error, 'Unable to delete upVote of the listing')
  }
}

export async function downVote(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const totalVotes = await addDownVote({
      listingId: reqBody.listingId,
      accountId: decodedAccount.id,
    })

    return handleSuccess(res, { downVoted: true, totalVotes })
  } catch (error) {
    console.error('Error occured while down voting the listing', error)
    return handleError(res, error, 'Unable to downVote the listing')
  }
}

export async function deleteDownVote(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const totalVotes = await removeDownVote({
      listingId: reqBody.listingId,
      accountId: decodedAccount.id,
    })

    return handleSuccess(res, { downVotedDeleted: true, totalVotes })
  } catch (error) {
    console.error('Error occured while deleting downVote of the listing', error)
    return handleError(res, error, 'Unable to delete downVote of the listing')
  }
}
