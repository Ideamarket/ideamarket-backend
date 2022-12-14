import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import {
  createTwitterOpinionDB,
  fetchAllTwitterOpinionsFromWeb2,
  fetchTwitterOpinionFromWeb2,
} from '../services/twitter-opinion.service'
import type {
  TwitterOpinionQueryOptions,
  TwitterOpinionResponse,
} from '../types/twitter-opinion.types'

export async function createTwitterOpinion(req: Request, res: Response) {
  try {
    const { decodedAccount } = req as any
    const ratedBy = decodedAccount.twitterUsername as string
    const ratedPostID = req.body.ratedPostID as string
    const rating = Number.parseInt(req.body.rating as string)
    const citations = [] as any // TODO

    const opinion = await createTwitterOpinionDB({
      ratedPostID,
      ratedBy,
      rating,
      citations,
    })

    return handleSuccess(res, { opinion })
  } catch (error) {
    console.error('Error occurred while creating the twitter opinion', error)
    return handleError(res, error, 'Unable to create the twitter opinion')
  }
}

export async function fetchAllTwitterOpinions(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof TwitterOpinionResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // If this non-null, then get all opinions of this user (if they are a user)
    const ratedBy = req.query.ratedBy ? (req.query.ratedBy as string) : null
    // If this non-null, then get all opinions for this post (if this is a post)
    const ratedPostID = req.query.ratedPostID
      ? (req.query.ratedPostID as string)
      : null
    const search = (req.query.search as string) || null
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true

    const options: TwitterOpinionQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      ratedBy,
      ratedPostID,
      search,
    }

    const opinions = await fetchAllTwitterOpinionsFromWeb2({ options })
    return handleSuccess(res, { opinions })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the twitter opinions',
      error
    )
    return handleError(res, error, 'Unable to fetch the twitter opinions')
  }
}

export async function fetchTwitterOpinion(req: Request, res: Response) {
  try {
    const opinionID = req.query.opinionID
      ? (req.query.opinionID as string)
      : null

    const opinion = await fetchTwitterOpinionFromWeb2({ opinionID })

    return handleSuccess(res, { opinion })
  } catch (error) {
    console.error('Error occurred while fetching the twitter opinion', error)
    return handleError(res, error, 'Unable to fetch the twitter opinion')
  }
}
