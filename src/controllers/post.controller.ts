import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import { syncAllCitedByPostsInWeb2 } from '../services/post-citedby-service'
import {
  fetchAllPostsFromWeb2,
  fetchPostCitationsFromWeb2,
  fetchCitedByPostsService,
  fetchPostCompositeRatingsFromWeb2,
  fetchPostFromWeb2,
  fetchPostOpinionsByTokenIdFromWeb2,
  fetchPostOpinionsByWalletFromWeb2,
  syncAllPostsInWeb2,
  syncPostInWeb2,
} from '../services/post.service'
import type {
  PostCitationsQueryOptions,
  PostCitedByQueryOptions,
  PostOpinionsQueryOptions,
  PostOpinionWithPostResponse,
  PostQueryOptions,
  PostResponse,
} from '../types/post.types'

export async function fetchAllPosts(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const minterAddress = req.query.minterAddress
      ? (req.query.minterAddress as string).toLowerCase()
      : null
    const search = (req.query.search as string) || null
    const categories =
      (req.query.categories as string | undefined)?.split(',') ?? []
    const filterTokens =
      (req.query.filterTokens as string | undefined)?.split(',') ?? []
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null
    if (startDate) {
      startDate.setUTCHours(0, 0, 0, 0)
    }
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null
    if (endDate) {
      endDate.setUTCHours(23, 59, 59, 999)
    }

    const options: PostQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      minterAddress,
      search,
      categories,
      filterTokens,
      startDate,
      endDate,
    }

    const posts = await fetchAllPostsFromWeb2({ contractAddress, options })
    return handleSuccess(res, { posts })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the ideamarket posts',
      error
    )
    return handleError(res, error, 'Unable to fetch the ideamarket posts')
  }
}

export async function fetchPost(req: Request, res: Response) {
  try {
    const tokenID = req.query.tokenID
      ? Number.parseInt(req.query.tokenID as string)
      : null
    const content = req.query.content ? (req.query.content as string) : null

    const post = await fetchPostFromWeb2({ tokenID, content })

    return handleSuccess(res, { post })
  } catch (error) {
    console.error('Error occurred while fetching the ideamarket post', error)
    return handleError(res, error, 'Unable to fetch the ideamarket post')
  }
}

export async function fetchPostCitations(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const tokenID = Number.parseInt(req.query.tokenID as string)
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: PostCitationsQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const citations = await fetchPostCitationsFromWeb2({
      contractAddress,
      tokenID,
      options,
    })
    return handleSuccess(res, { citations })
  } catch (error) {
    console.error('Error occurred while fetching all the citations', error)
    return handleError(res, error, 'Unable to fetch the citations')
  }
}

export async function fetchCitedByPosts(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const tokenID = Number.parseInt(req.query.tokenID as string)
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: PostCitedByQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const citedByPosts = await fetchCitedByPostsService({
      contractAddress,
      tokenID,
      options,
    })
    return handleSuccess(res, citedByPosts)
  } catch (error) {
    console.error('Error occurred while fetching all the citedBy posts', error)
    return handleError(res, error, 'Unable to fetch the citedBy posts')
  }
}

export async function fecthPostOpinionsByTokenId(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const tokenID = Number.parseInt(req.query.tokenID as string)
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PostOpinionWithPostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null

    const options: PostOpinionsQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      filterTokens: [],
    }

    const postOpinions = await fetchPostOpinionsByTokenIdFromWeb2({
      contractAddress,
      tokenID,
      options,
    })

    return handleSuccess(res, postOpinions)
  } catch (error) {
    console.error(
      'Error occurred while fetching post opinions by tokenID',
      error
    )
    return handleError(res, error, 'Unable to fetch post opinions by tokenID')
  }
}

export async function fecthPostOpinionsByWallet(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const walletAddress = req.query.walletAddress as string
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PostOpinionWithPostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null
    const filterTokens =
      (req.query.filterTokens as string | undefined)
        ?.split(',')
        .map((token) => Number.parseInt(token)) ?? []

    const options: PostOpinionsQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      filterTokens,
    }

    const postOpinions = await fetchPostOpinionsByWalletFromWeb2({
      contractAddress,
      walletAddress,
      options,
    })

    return handleSuccess(res, postOpinions)
  } catch (error) {
    console.error(
      'Error occurred while fetching post opinions by tokenID',
      error
    )
    return handleError(res, error, 'Unable to fetch post opinions by tokenID')
  }
}

export async function syncAllPosts(req: Request, res: Response) {
  try {
    const tokenID = req.body.tokenID ? Number.parseInt(req.body.tokenID) : null

    if (tokenID) {
      await syncPostInWeb2(tokenID)
      return handleSuccess(res, {
        message: `Ideamarket post with tokenID=${tokenID} has been synced`,
      })
    }

    await syncAllPostsInWeb2()
    return handleSuccess(res, {
      message: 'All ideamarket posts have been synced',
    })
  } catch (error) {
    console.error(
      'Error occurred while syncing all the ideamarket posts',
      error
    )
    return handleError(res, error, 'Unable to sync ideamarket posts')
  }
}

export async function syncAllCitedByPosts(req: Request, res: Response) {
  try {
    await syncAllCitedByPostsInWeb2()

    return handleSuccess(res, {
      message: 'All citedBy posts have been synced',
    })
  } catch (error) {
    console.error('Error occurred while syncing all the citedBy posts', error)
    return handleError(res, error, 'Unable to sync citedBy posts')
  }
}

export async function fetchPostCompositeRatings(req: Request, res: Response) {
  try {
    const reqQuery = req.query
    const postId = reqQuery.postId ? (reqQuery.postId as string) : null
    const tokenID = reqQuery.tokenID
      ? Number.parseInt(reqQuery.tokenID as string)
      : null
    const startDate = new Date(reqQuery.startDate as string)
    const endDate = reqQuery.endDate
      ? new Date(reqQuery.endDate as string)
      : new Date()
    endDate.setUTCHours(23, 59, 59, 999)

    const data = await fetchPostCompositeRatingsFromWeb2({
      postId,
      tokenID,
      startDate,
      endDate,
    })
    return handleSuccess(res, data)
  } catch (error) {
    console.error(
      'Error occurred while fetching composite ratings of the post',
      error
    )
    return handleError(
      res,
      error,
      'Unable to fetch composite ratings of the post'
    )
  }
}
