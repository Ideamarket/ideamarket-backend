import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import type { TwitterOpinionDocument } from '../models/twitter-opinion.model'
import { TwitterOpinionModel } from '../models/twitter-opinion.model'
import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import type {
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

    return true
  } catch (error) {
    console.error('Error occurred while creating Twitter opinion in DB', error)
    return await Promise.resolve(null)
  }
}

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
    filterOptions.push({ ratedBy })
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

  // tODO: add in userToken and username
  let opinions = []
  if (latest) {
    opinions = await TwitterOpinionModel.aggregate([
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
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
  } else {
    opinions = await TwitterOpinionModel.aggregate([
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
  }

  return Promise.all(
    opinions.map((opinion: any) => mapTwitterOpinionResponse(opinion))
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
  const posts = await TwitterOpinionModel.aggregate([
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

  return mapTwitterOpinionResponse(posts[0])
}
