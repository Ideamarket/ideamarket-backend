import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllTwitterPostsFromWeb2,
  // fetchPostCitationsFromWeb2,
  // fetchCitedByPostsService,
  // fetchPostCompositeRatingsFromWeb2,
  fetchTwitterPostFromWeb2,
  // fetchPostOpinionsByTokenIdFromWeb2,
  // fetchPostOpinionsByWalletFromWeb2,
  updateTwitterPostDB,
} from '../services/twitter-post.service'
import type {
  // TwitterPostCitationsQueryOptions,
  // TwitterPostCitedByQueryOptions,
  // TwitterPostOpinionsQueryOptions,
  // TwitterPostOpinionWithPostResponse,
  TwitterPostQueryOptions,
  TwitterPostRequest,
  TwitterPostResponse,
} from '../types/twitter-post.types'

export async function fetchAllTwitterPosts(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof TwitterPostResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const twitterUsername = req.query.twitterUsername
      ? (req.query.twitterUsername as string).toLowerCase()
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

    const options: TwitterPostQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      twitterUsername,
      search,
      categories,
      filterTokens,
      startDate,
      endDate,
    }

    const posts = await fetchAllTwitterPostsFromWeb2({ options })
    return handleSuccess(res, { posts })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the ideamarket twitter posts',
      error
    )
    return handleError(
      res,
      error,
      'Unable to fetch the ideamarket twitter posts'
    )
  }
}

export async function fetchTwitterPost(req: Request, res: Response) {
  try {
    const postID = req.query.postID ? (req.query.postID as string) : null
    const content = req.query.content ? (req.query.content as string) : null

    const post = await fetchTwitterPostFromWeb2({ postID, content })

    return handleSuccess(res, { post })
  } catch (error) {
    console.error('Error occurred while fetching the ideamarket post', error)
    return handleError(res, error, 'Unable to fetch the ideamarket post')
  }
}

export async function updateTwitterPost(req: Request, res: Response) {
  try {
    const postID = (req.body.postID as string) || null
    const twitterUsername = (req.body.twitterUsername as string) || null
    const content = (req.body.content as string) || null
    const categories =
      (req.body.categories as string | undefined)?.split(',') ?? []

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const twitterPost = {
      postID,
      twitterUsername,
      content,
      categories,
    } as TwitterPostRequest

    await updateTwitterPostDB({
      twitterPost,
    })
    return handleSuccess(res, {
      message: `Ideamarket post with postID=${
        postID as string
      } has been updated`,
    })
  } catch (error) {
    console.error(
      `Error occurred while updating Ideamarket post with postID=${
        req.body.postID as string
      }`,
      error
    )
    return handleError(res, error, 'Unable to update ideamarket twitter post')
  }
}

// export async function fetchPostCitations(req: Request, res: Response) {
//   try {
//     const contractAddress = req.query.contractAddress
//       ? (req.query.contractAddress as string)
//       : null
//     const tokenID = Number.parseInt(req.query.tokenID as string)
//     const latest = req.query.latest
//       ? (req.query.latest as string) === 'true'
//       : true
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof TwitterPostResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'

//     const options: TwitterPostCitationsQueryOptions = {
//       latest,
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//     }

//     const citations = await fetchPostCitationsFromWeb2({
//       contractAddress,
//       tokenID,
//       options,
//       addCitationsOfCitations: true,
//     })
//     return handleSuccess(res, { citations })
//   } catch (error) {
//     console.error('Error occurred while fetching all the citations', error)
//     return handleError(res, error, 'Unable to fetch the citations')
//   }
// }

// export async function fetchCitedByPosts(req: Request, res: Response) {
//   try {
//     const contractAddress = req.query.contractAddress
//       ? (req.query.contractAddress as string)
//       : null
//     const tokenID = Number.parseInt(req.query.tokenID as string)
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof TwitterPostResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'

//     const options: TwitterPostCitedByQueryOptions = {
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//     }

//     const citedByPosts = await fetchCitedByPostsService({
//       contractAddress,
//       tokenID,
//       options,
//     })
//     return handleSuccess(res, citedByPosts)
//   } catch (error) {
//     console.error('Error occurred while fetching all the citedBy posts', error)
//     return handleError(res, error, 'Unable to fetch the citedBy posts')
//   }
// }

// export async function fetchPostOpinionsByTokenId(req: Request, res: Response) {
//   try {
//     const contractAddress = req.query.contractAddress
//       ? (req.query.contractAddress as string)
//       : null
//     const tokenID = Number.parseInt(req.query.tokenID as string)
//     const latest = req.query.latest
//       ? (req.query.latest as string) === 'true'
//       : true
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof TwitterPostOpinionWithPostResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'
//     const search = (req.query.search as string) || null

//     const options: TwitterPostOpinionsQueryOptions = {
//       latest,
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//       search,
//       filterTokens: [],
//     }

//     const postOpinions = await fetchPostOpinionsByTokenIdFromWeb2({
//       contractAddress,
//       tokenID,
//       options,
//     })

//     return handleSuccess(res, postOpinions)
//   } catch (error) {
//     console.error(
//       'Error occurred while fetching post opinions by tokenID',
//       error
//     )
//     return handleError(res, error, 'Unable to fetch post opinions by tokenID')
//   }
// }

// export async function fetchPostOpinionsByWallet(req: Request, res: Response) {
//   try {
//     const contractAddress = req.query.contractAddress
//       ? (req.query.contractAddress as string)
//       : null
//     const walletAddress = req.query.walletAddress as string
//     const latest = req.query.latest
//       ? (req.query.latest as string) === 'true'
//       : true
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof TwitterPostOpinionWithPostResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'
//     const search = (req.query.search as string) || null
//     const filterTokens =
//       (req.query.filterTokens as string | undefined)
//         ?.split(',')
//         .map((token) => Number.parseInt(token)) ?? []

//     const options: TwitterPostOpinionsQueryOptions = {
//       latest,
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//       search,
//       filterTokens,
//     }

//     const postOpinions = await fetchPostOpinionsByWalletFromWeb2({
//       contractAddress,
//       walletAddress,
//       options,
//     })

//     return handleSuccess(res, postOpinions)
//   } catch (error) {
//     console.error(
//       'Error occurred while fetching post opinions by tokenID',
//       error
//     )
//     return handleError(res, error, 'Unable to fetch post opinions by tokenID')
//   }
// }

// export async function fetchPostCompositeRatings(req: Request, res: Response) {
//   try {
//     const reqQuery = req.query
//     const postId = reqQuery.postId ? (reqQuery.postId as string) : null
//     const tokenID = reqQuery.tokenID
//       ? Number.parseInt(reqQuery.tokenID as string)
//       : null
//     const startDate = new Date(reqQuery.startDate as string)
//     const endDate = reqQuery.endDate
//       ? new Date(reqQuery.endDate as string)
//       : new Date()
//     endDate.setUTCHours(23, 59, 59, 999)

//     const data = await fetchPostCompositeRatingsFromWeb2({
//       postId,
//       tokenID,
//       startDate,
//       endDate,
//     })
//     return handleSuccess(res, data)
//   } catch (error) {
//     console.error(
//       'Error occurred while fetching composite ratings of the post',
//       error
//     )
//     return handleError(
//       res,
//       error,
//       'Unable to fetch composite ratings of the post'
//     )
//   }
// }
