import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import type { TwitterOpinionDocument } from '../models/twitter-opinion.model'
import { TwitterOpinionModel } from '../models/twitter-opinion.model'
import type { TwitterPostDocument } from '../models/twitter-post.model'
import { TwitterPostModel } from '../models/twitter-post.model'
import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import { TwitterUserTokenModel } from '../models/twitter-user-token.model'
import type {
  TwitterCitation,
  TwitterOpinionQueryOptions,
  TwitterOpinionRequest,
} from '../types/twitter-opinion.types'
import { mapTwitterOpinionResponse } from '../util/twitterOpinionUtil'

export async function createTwitterOpinionDB(
  twitterOpinion: TwitterOpinionRequest
) {
  try {
    const twitterPostDoc = TwitterOpinionModel.build({
      ratedPostID: twitterOpinion.ratedPostID,
      ratedBy: twitterOpinion.ratedBy,
      ratedAt: new Date(),
      rating: twitterOpinion.rating,
      citations: twitterOpinion.citations,
    })
    await TwitterOpinionModel.create(twitterPostDoc)

    const opinionsSummary = await getOpinionsSummaryOfPost(
      twitterOpinion.ratedPostID
    )
    const {
      // allOpinions,
      averageRating,
      totalRatingsCount,
      latestRatingsCount,
    } = opinionsSummary

    await TwitterPostModel.findOneAndUpdate(
      { _id: twitterOpinion.ratedPostID },
      {
        $set: {
          averageRating,
          compositeRating: 0,
          marketInterest: 0,
          totalRatingsCount,
          latestRatingsCount,
        },
      }
    )

    return true
  } catch (error) {
    console.error('Error occurred while creating Twitter opinion in DB', error)
    return await Promise.resolve(null)
  }
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export async function fetchAllTwitterOpinionsFromWeb2({
  options,
}: {
  options: TwitterOpinionQueryOptions
}) {
  const { latest, skip, limit, orderBy, ratedBy, ratedPostID, search } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection
  sortOptions._id = 1

  // Filter Options
  const filterOptions: FilterQuery<
    TwitterOpinionDocument & TwitterUserTokenDocument
  >[] = []
  if (ratedBy) {
    filterOptions.push({ ratedBy: { $regex: new RegExp(ratedBy, 'iu') } })
  }
  if (ratedPostID) {
    filterOptions.push({ ratedPostID })
  }
  if (search) {
    filterOptions.push({
      $or: [
        // { content: { $regex: escapeStringRegexp(search), $options: 'i' } },
        {
          ratedBy: {
            $regex: escapeStringRegexp(search),
            $options: 'i',
          },
        },
        // { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  let opinions = []
  if (latest) {
    // When pulling opinions by specific ratedBy, need to do latestQuery differently or you only will get one opinion
    const latestQuery = ratedBy
      ? {
          $group: {
            _id: '$ratedPostID',
            doc: { $first: '$$ROOT' },
          },
        }
      : {
          $group: {
            _id: '$ratedBy',
            doc: { $first: '$$ROOT' },
          },
        }

    opinions = await TwitterOpinionModel.aggregate([
      {
        $lookup: {
          from: 'twitterusertokens',
          localField: 'ratedBy',
          foreignField: 'twitterUsername',
          as: 'TwitterUserTokens',
        },
      },
      { $set: { userToken: { $arrayElemAt: ['$TwitterUserTokens', 0] } } },
      // { $set: { username: '$userToken.username' } },
      { $match: filterQuery },
      { $sort: { ratedAt: -1, _id: -1 } },
      latestQuery,
      // eslint-disable-next-line unicorn/no-keyword-prefix
      { $replaceRoot: { newRoot: '$doc' } },
    ])
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
  } else {
    opinions = await TwitterOpinionModel.aggregate([
      {
        $lookup: {
          from: 'twitterusertokens',
          localField: 'ratedBy',
          foreignField: 'twitterUsername',
          as: 'TwitterUserTokens',
        },
      },
      { $set: { userToken: { $arrayElemAt: ['$TwitterUserTokens', 0] } } },
      // { $set: { username: '$userToken.username' } },
      { $match: filterQuery },
    ])
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
  }

  const citationPostsMap: Record<string, TwitterPostDocument | null> = {}
  const citationMintersMap: Record<string, TwitterUserTokenDocument | null> = {}
  for await (const postOpinion of opinions) {
    const citations =
      postOpinion.citations && postOpinion.citations.length > 0
        ? postOpinion.citations
        : []
    for await (const citation of citations) {
      // Adding citation posts
      const { postID } = citation
      if (citationPostsMap[postID]) {
        continue
      }
      const citationPost = await TwitterPostModel.findOne({ _id: postID })
      // eslint-disable-next-line require-atomic-updates
      citationPostsMap[postID] = citationPost
      if (!citationPost) {
        continue
      }

      // Adding citation users
      const { twitterUsername } = citationPost
      if (citationMintersMap[twitterUsername]) {
        continue
      }
      const user = await TwitterUserTokenModel.findOne({
        twitterUsername,
      })
      // eslint-disable-next-line require-atomic-updates
      citationMintersMap[twitterUsername] = user
    }
  }

  const postOpinionsWithPost = []
  // If pulling opinions of a user, we want the ratedPost's content to be added to response
  if (ratedBy) {
    for await (const postOpinion of opinions) {
      const post = await TwitterPostModel.findById({
        _id: postOpinion.ratedPostID,
      })
      postOpinionsWithPost.push({ ...postOpinion, ...post?.toObject() })
    }

    return Promise.all(
      postOpinionsWithPost.map((opinion: any) =>
        mapTwitterOpinionResponse(opinion, citationPostsMap, citationMintersMap)
      )
    )
  }

  return Promise.all(
    opinions.map((opinion: any) =>
      mapTwitterOpinionResponse(opinion, citationPostsMap, citationMintersMap)
    )
  )
}

export async function fetchTwitterOpinionFromWeb2({
  opinionID,
}: {
  opinionID: string | null
}) {
  if (!opinionID) {
    return null
  }
  const filterOptions: FilterQuery<TwitterOpinionDocument>[] = []
  if (opinionID) {
    filterOptions.push({ _id: new mongoose.Types.ObjectId(opinionID) })
  }

  // Filter Query
  const filterQuery = { $and: filterOptions }

  // TODO
  const opinions = await TwitterOpinionModel.aggregate([
    { $match: filterQuery },
    // {
    //   $lookup: {
    //     from: 'usertokens',
    //     localField: 'twitterUsername',
    //     foreignField: 'walletAddress',
    //     as: 'UserTokens',
    //   },
    // },
    // { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
  ])

  const citationPostsMap: Record<string, TwitterPostDocument | null> = {}
  const citationMintersMap: Record<string, TwitterUserTokenDocument | null> = {}

  const citations = opinions[0].citations as TwitterCitation[]
  for await (const citation of citations) {
    // Adding citation posts
    const { postID } = citation
    if (citationPostsMap[postID]) {
      continue
    }
    const citationPost = await TwitterPostModel.findOne({ postID })
    citationPostsMap[postID] = citationPost
    if (!citationPost) {
      continue
    }

    // Adding citation users
    const { twitterUsername } = citationPost
    if (citationMintersMap[twitterUsername]) {
      continue
    }
    const user = await TwitterUserTokenModel.findOne({
      twitterUsername,
    })
    citationMintersMap[twitterUsername] = user
  }

  return mapTwitterOpinionResponse(
    opinions[0],
    citationPostsMap,
    citationMintersMap
  )
}

/**
 * Get the opinions data of a post
 * @param postID -- postID of the post
 */
export async function getOpinionsSummaryOfPost(postID: string) {
  const allOpinions = await getAllOpinionsOfPost(postID)
  const latestOpinions = await getLatestOpinionsOfPost(postID)

  const averageRating = calculateAverageRating(latestOpinions)
  const totalRatingsCount = allOpinions.length
  const latestRatingsCount = latestOpinions.length

  return {
    allOpinions,
    latestOpinions,
    averageRating,
    totalRatingsCount,
    latestRatingsCount,
  }
}

/**
 * Get all opinions of a post (includes past ratings from users).
 * @param postID
 */
export async function getAllOpinionsOfPost(postID: string): Promise<any[]> {
  return TwitterOpinionModel.find({ ratedPostID: postID })
}

/**
 * Get latest opinions of a post
 * (doesn't include past ratings from users, just most recent).
 * @param postID
 */
export async function getLatestOpinionsOfPost(postID: string): Promise<any[]> {
  const filterOptions: FilterQuery<
    TwitterOpinionDocument & TwitterUserTokenDocument
  >[] = []

  filterOptions.push({ ratedPostID: postID })

  const filterQuery = { $and: filterOptions }

  return TwitterOpinionModel.aggregate([
    { $match: filterQuery },
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
}

/**
 * Calculate average rating from the opinions
 */
function calculateAverageRating(opinions: any[]) {
  const ratings: number[] | undefined = opinions.map((opinion: any) =>
    Number(opinion.rating)
  )
  if (ratings.length <= 0) {
    return 0
  }
  return ratings.reduce((a, b) => a + b, 0) / ratings.length
}
