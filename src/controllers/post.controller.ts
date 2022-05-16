import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllPostsFromWeb2,
  fetchPostFromWeb2,
  fetchPostOpinionsByTokenIdFromWeb2,
  fetchPostOpinionsByWalletFromWeb2,
  syncAllPostsInWeb2,
  syncPostInWeb2,
} from '../services/post.service'
import type {
  PostOpinionsQueryOptions,
  PostOpinionWithPostResponse,
  PostQueryOptions,
  PostResponse,
} from '../types/post.types'

export async function fetchAllPosts(req: Request, res: Response) {
  try {
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

    const options: PostQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      minterAddress,
      search,
      categories,
      filterTokens,
    }

    const posts = await fetchAllPostsFromWeb2(options)
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