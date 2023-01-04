import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import type { TwitterOpinionDocument } from '../models/twitter-opinion.model'
import { TwitterOpinionModel } from '../models/twitter-opinion.model'
import type { TwitterPostDocument } from '../models/twitter-post.model'
import { TwitterPostModel } from '../models/twitter-post.model'
import type { UserTokenDocument } from '../models/user-token.model'
import { UserTokenModel } from '../models/user-token.model'
import type { Web3NFTOpinionData } from '../types/nft-opinion.types'
import type {
  TwitterCitationPostIds,
  TwitterPostCitationsQueryOptions,
  TwitterPostQueryOptions,
  TwitterPostRequest,
} from '../types/twitter-post.types'
import { mapTwitterPostResponse } from '../util/twitterPostUtil'
import { fetchAllTwitterOpinionsFromWeb2 } from './twitter-opinion.service'

export async function fetchAllTwitterPostsFromWeb2({
  options,
}: {
  options: TwitterPostQueryOptions
}) {
  const {
    skip,
    limit,
    orderBy,
    twitterUsername,
    search,
    categories,
    filterTokens,
    startDate,
    endDate,
  } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection
  sortOptions._id = 1

  // Filter Options
  const filterOptions: FilterQuery<TwitterPostDocument & UserTokenDocument>[] =
    []
  if (categories.length > 0) {
    filterOptions.push({ categories: { $in: categories } })
  }
  if (filterTokens.length > 0) {
    filterOptions.push({ postID: { $in: filterTokens } })
  }
  if (twitterUsername) {
    filterOptions.push({ twitterUsername })
  }
  if (search) {
    filterOptions.push({
      $or: [
        { content: { $regex: escapeStringRegexp(search), $options: 'i' } },
        {
          twitterUsername: {
            $regex: escapeStringRegexp(search),
            $options: 'i',
          },
        },
        // { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
      ],
    })
  }
  if (startDate && endDate) {
    filterOptions.push({ postedAt: { $gte: startDate, $lte: endDate } })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  // tODO: add in userToken and username
  const posts = await TwitterPostModel.aggregate([
    // {
    //   $lookup: {
    //     from: 'usertokens',
    //     localField: 'twitterUsername',
    //     foreignField: 'walletAddress',
    //     as: 'UserTokens',
    //   },
    // },
    // { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    // { $set: { username: '$userToken.username' } },
    { $match: filterQuery },
  ])
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return Promise.all(
    posts.map((post: any) =>
      fetchAdditionalPostDataAndMap({
        post,
        addCitationsOfCitations: false,
        citationPostIds: null,
      })
    )
  )
}

export async function fetchTwitterPostFromWeb2({
  postID,
  content,
}: {
  postID: string | null
  content: string | null
}) {
  if (!postID && !content) {
    return null
  }
  const filterOptions: FilterQuery<TwitterPostDocument>[] = []
  if (postID) {
    filterOptions.push({ _id: new mongoose.Types.ObjectId(postID) })
  }
  if (content) {
    filterOptions.push({ content })
  }

  // Filter Query
  const filterQuery = { $and: filterOptions }

  const posts = await TwitterPostModel.aggregate([
    { $match: filterQuery },
    {
      $lookup: {
        from: 'TwitterUserToken',
        localField: 'twitterUsername',
        foreignField: 'twitterUsername',
        as: 'TwitterUserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$TwitterUserTokens', 0] } } },
  ])

  return mapTwitterPostResponse(posts[0])
}

export async function updateTwitterPostDB({
  twitterPost,
}: {
  twitterPost: TwitterPostRequest
}) {
  try {
    console.log(
      `Fetching post opinions summary for postID=${twitterPost.postID}`
    )
    // const postOpinionsSummary = await getOpinionsSummaryOfNFT(post.postID)

    console.log(`Calculating composite rating for postID=${twitterPost.postID}`)
    // const latestOpinions: Web3NFTOpinionData[] = []
    // for await (const opinion of postOpinionsSummary.latestOpinions) {
    //   latestOpinions.push({
    //     postID: opinion.postID,
    //     author: opinion.author.toLowerCase(),
    //     timestamp: opinion.postedAt,
    //     rating: opinion.rating,
    //     comment: opinion.comment,
    //     citations: opinion.citations,
    //   })
    // }
    // const { compositeRating, marketInterest } =
    //   await calculateCompositeRatingAndMarketInterest(latestOpinions)

    console.log(
      `Updating post and opinions summary for postID=${twitterPost.postID}`
    )

    let updatedPost = null
    if (twitterPost.postID) {
      updatedPost = await TwitterPostModel.findOneAndUpdate(
        {
          _id: twitterPost.postID,
        },
        {
          $set: {
            twitterUsername: twitterPost.twitterUsername,
            content: twitterPost.content,
            categories: twitterPost.categories,
            averageRating: null,
            compositeRating: null,
            marketInterest: null,
            totalRatingsCount: null,
            latestRatingsCount: null,
          },
        },
        { upsert: true, new: true }
      )
    } else {
      const twitterPostDoc = TwitterPostModel.build({
        twitterUsername: twitterPost.twitterUsername,
        content: twitterPost.content,
        postedAt: new Date(),
        categories: twitterPost.categories,
        averageRating: 0,
        compositeRating: 0,
        marketInterest: 0,
        totalRatingsCount: 0,
        latestRatingsCount: 0,
      })
      await TwitterPostModel.create(twitterPostDoc)
      updatedPost = twitterPostDoc
    }

    // console.log(`Updating composite rating for postID=${twitterPost.postID}`)
    // const date = new Date()
    // const compositeRatingDoc = CompositeRatingModel.build({
    //   post: updatedPost,
    //   postID: updatedPost.postID,
    //   rating: compositeRating,
    //   date: date.toISOString().split('T')[0],
    //   timestamp: date,
    // })
    // await CompositeRatingModel.create(compositeRatingDoc)

    // return updatedPost
    return mapTwitterPostResponse(updatedPost)
  } catch (error) {
    console.error('Error occurred while updating Twitter post', error)
    return await Promise.resolve(null)
  }
}

export async function calculateCompositeRatingAndMarketInterest(
  opinions: Web3NFTOpinionData[]
) {
  let marketInterest = 0
  let weightedSum = 0

  for await (const opinion of opinions) {
    const marketCap = await getDeposits(opinion.author)
    marketInterest += marketCap
    weightedSum += marketCap * Number.parseInt(opinion.rating)
  }

  const compositeRating =
    marketInterest === 0 ? 0 : weightedSum / marketInterest

  return { compositeRating, marketInterest }
}

export async function getDeposits(walletAddress: string) {
  const userToken = await UserTokenModel.findOne({ walletAddress })
  return userToken?.deposits ?? 0
}

async function fetchAdditionalPostDataAndMap({
  post,
  addCitationsOfCitations,
  citationPostIds,
}: {
  post: any
  addCitationsOfCitations: boolean
  citationPostIds: TwitterCitationPostIds
}) {
  const topCitations = await fetchPostCitationsFromWeb2({
    postID: post._id.toString(),
    options: {
      latest: true,
      skip: 0,
      limit: 3,
      orderBy: 'latestRatingsCount', // TODO: order by new citation rating thing
      orderDirection: 'desc',
    },
    addCitationsOfCitations,
  })
  // eslint-disable-next-line require-atomic-updates
  post.topCitations = topCitations

  const topRatings = await fetchAllTwitterOpinionsFromWeb2({
    options: {
      latest: true,
      skip: 0,
      limit: 10,
      orderBy: 'rating',
      orderDirection: 'desc',
      ratedPostID: post._id.toString(),
      ratedBy: null,
      search: '',
    },
  })
  // eslint-disable-next-line require-atomic-updates
  post.topRatings = topRatings

  return mapTwitterPostResponse(post, citationPostIds)
}

export async function fetchPostCitationsFromWeb2({
  postID,
  options,
  addCitationsOfCitations,
}: {
  postID: string
  options: TwitterPostCitationsQueryOptions
  addCitationsOfCitations: boolean
}) {
  const { latest, skip, limit, orderBy } = options

  const citationPostIds = latest
    ? await fetchLatestPostCitationsPostIds({
        postID,
      })
    : await fetchAllPostCitationsPostIds({
        postID,
      })

  // Sorting Options
  const sortOptions: any = {}
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1
  sortOptions[orderBy] = orderDirection
  sortOptions._id = -1

  const filterOptions: FilterQuery<TwitterOpinionDocument>[] = []
  filterOptions.push({
    _id: {
      $in: [
        ...citationPostIds.forCitationsPostIds,
        ...citationPostIds.againstCitationsPostIds,
      ],
    },
  })

  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const citationPosts = await TwitterPostModel.aggregate([
    // {
    //   $lookup: {
    //     from: 'usertokens',
    //     localField: 'minterAddress',
    //     foreignField: 'walletAddress',
    //     as: 'UserTokens',
    //   },
    // },
    // { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    { $match: filterQuery },
  ])
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return Promise.all(
    citationPosts.map((post: any) =>
      addCitationsOfCitations
        ? fetchAdditionalPostDataAndMap({
            post,
            addCitationsOfCitations: false,
            citationPostIds,
          })
        : mapTwitterPostResponse(post, citationPostIds)
    )
  )
}

export async function fetchAllPostCitationsPostIds({
  postID,
}: {
  postID: string
}) {
  const opinions: TwitterOpinionDocument[] = await TwitterOpinionModel.find({
    ratedPostID: postID,
  })
  const forCitationsSet = new Set<mongoose.Types.ObjectId>()
  const againstCitationsSet = new Set<mongoose.Types.ObjectId>()

  for (const opinion of opinions) {
    for (const citation of opinion.citations) {
      if (citation.inFavor) {
        forCitationsSet.add(new mongoose.Types.ObjectId(citation.postID))
      } else {
        againstCitationsSet.add(new mongoose.Types.ObjectId(citation.postID))
      }
    }
  }

  return {
    forCitationsPostIds: [...forCitationsSet],
    againstCitationsPostIds: [...againstCitationsSet],
  }
}

export async function fetchLatestPostCitationsPostIds({
  postID,
}: {
  postID: string
}) {
  const opinions: TwitterOpinionDocument[] =
    await TwitterOpinionModel.aggregate([
      { $match: { ratedPostID: postID } },
      { $sort: { ratedAt: -1, _id: -1 } },
      {
        $group: {
          _id: '$ratedBy',
          doc: { $first: '$$ROOT' },
        },
      },
      // eslint-disable-next-line unicorn/no-keyword-prefix
      { $replaceRoot: { newRoot: '$doc' } },
    ])

  const forCitationsSet = new Set<mongoose.Types.ObjectId>()
  const againstCitationsSet = new Set<mongoose.Types.ObjectId>()

  for (const opinion of opinions) {
    for (const citation of opinion.citations) {
      if (citation.inFavor) {
        forCitationsSet.add(new mongoose.Types.ObjectId(citation.postID))
      } else {
        againstCitationsSet.add(new mongoose.Types.ObjectId(citation.postID))
      }
    }
  }

  return {
    forCitationsPostIds: [...forCitationsSet],
    againstCitationsPostIds: [...againstCitationsSet],
  }
}
