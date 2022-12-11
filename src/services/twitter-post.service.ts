 
 
 
 
 
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

// import type { CompositeRatingDocument } from '../models/composite-rating-model'
// import { CompositeRatingModel } from '../models/composite-rating-model'
// import type { Citation, NFTOpinionDocument } from '../models/nft-opinion.model'
// import { NFTOpinionModel } from '../models/nft-opinion.model'
// import { PostCitedByModel } from '../models/post-citedby-model'
import type { TwitterPostDocument } from '../models/twitter-post.model'
import { TwitterPostModel } from '../models/twitter-post.model'
import type { UserTokenDocument } from '../models/user-token.model'
import { UserTokenModel } from '../models/user-token.model'
import type { Web3NFTOpinionData } from '../types/nft-opinion.types'
import type {
  // TwitterCitationTokenIds,
  // TwitterPostCitationsQueryOptions,
  // TwitterPostCitedByQueryOptions,
  // TwitterPostOpinionsQueryOptions,
  TwitterPostQueryOptions,
  TwitterPostRequest,
  // TwitterPostResponse,
} from '../types/twitter-post.types'
// import { compareFn } from '../util'
// import { mapCompositeRating } from '../util/compositeRatingsUtil'
import {
  // mapPostOpinionResponse,
  // mapPostOpinionWithPost,
  mapPostResponse,
} from '../util/postUtil'
// import { getOpinionsSummaryOfNFT } from '../web3/opinions/nft-opinions'
// import { BadRequestError, InternalServerError } from './errors'

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filterQuery = { $and: filterOptions }
  }

  // tODO: add in userToken and username
  const posts = await TwitterPostModel
    // .aggregate([
    //   {
    //     $lookup: {
    //       from: 'usertokens',
    //       localField: 'twitterUsername',
    //       foreignField: 'walletAddress',
    //       as: 'UserTokens',
    //     },
    //   },
    //   { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    //   { $set: { username: '$userToken.username' } },
    //   { $match: filterQuery },
    // ])
    .find()
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return Promise.all(posts.map((post: any) => mapPostResponse(post)))
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

  // TODO
  const posts = await TwitterPostModel.aggregate([
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

  return mapPostResponse(posts[0])
}

// export async function fetchPostCitationsFromWeb2({
//   postID,
//   options,
//   addCitationsOfCitations,
// }: {
//   postID: number
//   options: TwitterPostCitationsQueryOptions
//   addCitationsOfCitations: boolean
// }) {
//   const { latest, skip, limit, orderBy } = options

//   const citationTokenIds = latest
//     ? await fetchLatestPostCitationsTokenIds({
//         postID,
//       })
//     : await fetchAllPostCitationsTokenIds({
//         postID,
//       })

//   // Sorting Options
//   const sortOptions: any = {}
//   const orderDirection = options.orderDirection === 'asc' ? 1 : -1
//   sortOptions[orderBy] = orderDirection
//   sortOptions._id = -1

//   const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
//   filterOptions.push(
//     {
//       postID: {
//         $in: [
//           ...citationTokenIds.forCitationsTokenIds,
//           ...citationTokenIds.againstCitationsTokenIds,
//         ],
//       },
//     }
//   )

//   let filterQuery = {}
//   if (filterOptions.length > 0) {
//     filterQuery = { $and: filterOptions }
//   }

//   const citationPosts = await TwitterPostModel.aggregate([
//     {
//       $lookup: {
//         from: 'usertokens',
//         localField: 'twitterUsername',
//         foreignField: 'walletAddress',
//         as: 'UserTokens',
//       },
//     },
//     { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
//     { $match: filterQuery },
//   ])
//     .sort(sortOptions)
//     .skip(skip)
//     .limit(limit)

//   return Promise.all(
//     citationPosts.map((post: any) =>
//       addCitationsOfCitations
//         ? fetchAdditionalPostDataAndMap({
//             post,
//             addCitationsOfCitations: false,
//             citationTokenIds,
//           })
//         : mapPostResponse(post, citationTokenIds)
//     )
//   )
// }

// async function fetchAdditionalPostDataAndMap({
//   post,
//   addCitationsOfCitations,
//   citationTokenIds,
// }: {
//   post: any
//   addCitationsOfCitations: boolean
//   citationTokenIds: TwitterCitationTokenIds
// }) {
//   const topCitations = await fetchPostCitationsFromWeb2({
//     postID: post.postID,
//     options: {
//       latest: true,
//       skip: 0,
//       limit: 3,
//       orderBy: 'marketInterest', // TODO: order by new citation rating thing
//       orderDirection: 'desc',
//     },
//     addCitationsOfCitations,
//   })
//   post.topCitations = topCitations

//   const topRatings = await fetchPostOpinionsByTokenIdFromWeb2({
//     postID: post.postID,
//     options: {
//       latest: true,
//       skip: 0,
//       limit: 10,
//       orderBy: 'deposits',
//       orderDirection: 'desc',
//       search: '',
//       filterTokens: [],
//     },
//   })
//   post.topRatings = topRatings.postOpinions

//   return mapPostResponse(post, citationTokenIds)
// }

// export async function fetchAllPostCitationsTokenIds({
//   postID,
// }: {
//   postID: number
// }) {
//   const opinions = await NFTOpinionModel.find({ postID })
//   const forCitationsSet = new Set<number>()
//   const againstCitationsSet = new Set<number>()

//   for (const opinion of opinions) {
//     for (const citation of opinion.citations) {
//       if (citation.inFavor) {
//         forCitationsSet.add(citation.postID)
//       } else {
//         againstCitationsSet.add(citation.postID)
//       }
//     }
//   }

//   return {
//     forCitationsTokenIds: [...forCitationsSet],
//     againstCitationsTokenIds: [...againstCitationsSet],
//   }
// }

// export async function fetchLatestPostCitationsTokenIds({
//   postID,
// }: {
//   postID: number
// }) {
//   const opinions: NFTOpinionDocument[] = await NFTOpinionModel.aggregate([
//     { $match: { postID } },
//     { $sort: { ratedAt: -1, _id: -1 } },
//     {
//       $group: {
//         _id: '$ratedBy',
//         doc: { $first: '$$ROOT' },
//       },
//     },
//     { $replaceRoot: { newRoot: '$doc' } },
//   ])

//   const forCitationsSet = new Set<number>()
//   const againstCitationsSet = new Set<number>()

//   for (const opinion of opinions) {
//     for (const citation of opinion.citations) {
//       if (citation.inFavor) {
//         forCitationsSet.add(citation.postID)
//       } else {
//         againstCitationsSet.add(citation.postID)
//       }
//     }
//   }

//   return {
//     forCitationsTokenIds: [...forCitationsSet],
//     againstCitationsTokenIds: [...againstCitationsSet],
//   }
// }

// export async function fetchCitedByPostsService({
//   postID,
//   options,
// }: {
//   postID: number
//   options: TwitterPostCitedByQueryOptions
// }) {
//   try {
//     const postCitedBy = await PostCitedByModel.findOne({
//       postID,
//     })
//     if (!postCitedBy) {
//       return []
//     }

//     const citedByTokenIds = postCitedBy.citedBy

//     const { skip, limit, orderBy } = options

//     // Sorting Options
//     const sortOptions: any = {}
//     const orderDirection = options.orderDirection === 'asc' ? 1 : -1
//     sortOptions[orderBy] = orderDirection
//     sortOptions._id = -1

//     // Filter Options
//     const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
//     filterOptions.push(
//       { postID: { $in: citedByTokenIds } }
//     )
//     // Filter Query
//     let filterQuery = {}
//     if (filterOptions.length > 0) {
//       filterQuery = { $and: filterOptions }
//     }

//     const citedByPosts = await TwitterPostModel.aggregate([
//       {
//         $lookup: {
//           from: 'usertokens',
//           localField: 'twitterUsername',
//           foreignField: 'walletAddress',
//           as: 'UserTokens',
//         },
//       },
//       { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
//       { $match: filterQuery },
//     ])
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(limit)

//     return citedByPosts.map((post) => mapPostResponse(post))
//   } catch (error) {
//     console.error('Error occurred while fetching citedBy posts', error)
//     throw new InternalServerError('Failed to fetch citedBy posts')
//   }
// }

// export async function fetchPostOpinionsByTokenIdFromWeb2({
//   postID,
//   options,
// }: {
//   postID: number
//   options: TwitterPostOpinionsQueryOptions
// }) {

//   const { latest } = options

//   const postOpinions = latest
//     ? await fetchLatestPostOpinionsByTokenIdFromWeb2({
//         postID,
//         options,
//       })
//     : await fetchAllPostOpinionsByTokenIdFromWeb2({
//         postID,
//         options,
//       })

//   return {
//     postID,
//     postOpinions,
//   }
// }

// async function fetchAllPostOpinionsByTokenIdFromWeb2({
//   postID,
//   options,
// }: {
//   postID: number
//   options: TwitterPostOpinionsQueryOptions
// }) {
//   const { skip, limit, orderBy, search } = options
//   const orderDirection = options.orderDirection === 'asc' ? 1 : -1

//   // Sorting Options
//   const sortOptions: any = {}
//   sortOptions[orderBy] = orderDirection

//   // Filter Options
//   const filterOptions: FilterQuery<NFTOpinionDocument & UserTokenDocument>[] =
//     []
//   filterOptions.push({ postID })
//   if (search) {
//     filterOptions.push({
//       $or: [
//         { comment: { $regex: escapeStringRegexp(search), $options: 'i' } },
//         { ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' } },
//         { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
//       ],
//     })
//   }

//   // Filter Query
//   let filterQuery = {}
//   if (filterOptions.length > 0) {
//     filterQuery = { $and: filterOptions }
//   }

//   const postOpinions = await NFTOpinionModel.aggregate([
//     {
//       $lookup: {
//         from: 'usertokens',
//         localField: 'ratedBy',
//         foreignField: 'walletAddress',
//         as: 'UserTokens',
//       },
//     },
//     { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
//     { $set: { username: '$userToken.username' } },
//     { $set: { deposits: '$userToken.deposits' } },
//     { $match: filterQuery },
//   ])
//     .sort(sortOptions)
//     .skip(skip)
//     .limit(limit)

//   const citationPostsMap: Record<number, TwitterPostDocument | null> = {}
//   const citationMintersMap: Record<string, UserTokenDocument | null> = {}
//   for await (const postOpinion of postOpinions) {
//     const citations = postOpinion.citations as Citation[]
//     for await (const citation of citations) {
//       // Adding citation posts
//       const { postID } = citation
//       if (citationPostsMap[postID]) {
//         continue
//       }
//       const citationPost = await TwitterPostModel.findOne({ postID })
//       citationPostsMap[postID] = citationPost
//       if (!citationPost) {
//         continue
//       }

//       // Adding citation minters
//       const { twitterUsername } = citationPost
//       if (citationMintersMap[twitterUsername]) {
//         continue
//       }
//       const minter = await UserTokenModel.findOne({
//         walletAddress: twitterUsername,
//       })
//       citationMintersMap[twitterUsername] = minter
//     }
//   }

//   return postOpinions.map((postOpinion) =>
//     mapPostOpinionResponse(postOpinion, citationPostsMap, citationMintersMap)
//   )
// }

// async function fetchLatestPostOpinionsByTokenIdFromWeb2({
//   postID,
//   options,
// }: {
//   postID: number
//   options: TwitterPostOpinionsQueryOptions
// }) {
//   const { skip, limit, orderBy, search } = options
//   const orderDirection = options.orderDirection === 'asc' ? 1 : -1

//   // Sorting Options
//   const sortOptions: any = {}
//   sortOptions[orderBy] = orderDirection

//   // Filter Options
//   const filterOptions: FilterQuery<NFTOpinionDocument & UserTokenDocument>[] =
//     []
//   filterOptions.push({ postID })
//   if (search) {
//     filterOptions.push({
//       $or: [
//         { comment: { $regex: escapeStringRegexp(search), $options: 'i' } },
//         { ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' } },
//         { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
//       ],
//     })
//   }

//   // Filter Query
//   let filterQuery = {}
//   if (filterOptions.length > 0) {
//     filterQuery = { $and: filterOptions }
//   }

//   const postOpinions = await NFTOpinionModel.aggregate([
//     {
//       $lookup: {
//         from: 'usertokens',
//         localField: 'ratedBy',
//         foreignField: 'walletAddress',
//         as: 'UserTokens',
//       },
//     },
//     { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
//     { $set: { username: '$userToken.username' } },
//     { $set: { deposits: '$userToken.deposits' } },
//     { $match: filterQuery },
//     { $sort: { ratedAt: -1, _id: -1 } },
//     {
//       $group: {
//         _id: '$ratedBy',
//         doc: { $first: '$$ROOT' },
//       },
//     },
//     { $replaceRoot: { newRoot: '$doc' } },
//   ])
//     .sort(sortOptions)
//     .skip(skip)
//     .limit(limit)

//   const citationPostsMap: Record<number, TwitterPostDocument | null> = {}
//   const citationMintersMap: Record<string, UserTokenDocument | null> = {}
//   for await (const postOpinion of postOpinions) {
//     const citations = postOpinion.citations as Citation[]
//     for await (const citation of citations) {
//       // Adding citation posts
//       const { postID } = citation
//       if (citationPostsMap[postID]) {
//         continue
//       }
//       const citationPost = await TwitterPostModel.findOne({ postID })
//       citationPostsMap[postID] = citationPost
//       if (!citationPost) {
//         continue
//       }

//       // Adding citation minters
//       const { twitterUsername } = citationPost
//       if (citationMintersMap[twitterUsername]) {
//         continue
//       }
//       const minter = await UserTokenModel.findOne({
//         walletAddress: twitterUsername,
//       })
//       citationMintersMap[twitterUsername] = minter
//     }
//   }

//   return postOpinions.map((postOpinion) =>
//     mapPostOpinionResponse(postOpinion, citationPostsMap, citationMintersMap)
//   )
// }

// export async function fetchPostOpinionsByWalletFromWeb2({
//   walletAddress,
//   options,
// }: {
//   walletAddress: string
//   options: TwitterPostOpinionsQueryOptions
// }) {

//   const { latest, orderBy, orderDirection, skip, limit, search } = options
//   const postOpinions = latest
//     ? await fetchLatestPostOpinionsByWalletFromWeb2({
//         walletAddress,
//         options,
//       })
//     : await fetchAllPostOpinionsByWalletFromWeb2({
//         walletAddress,
//         options,
//       })

//   const postOpinionsWithPost = []
//   for await (const postOpinion of postOpinions) {
//     const posts = await TwitterPostModel.aggregate([
//       { $match: { postID: postOpinion.postID } },
//       {
//         $lookup: {
//           from: 'usertokens',
//           localField: 'twitterUsername',
//           foreignField: 'walletAddress',
//           as: 'UserTokens',
//         },
//       },
//       { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
//     ])

//     const citationPostsMap: Record<number, TwitterPostDocument | null> = {}
//     const citationMintersMap: Record<string, UserTokenDocument | null> = {}
//     const citations = postOpinion.citations as Citation[]
//     for await (const citation of citations) {
//       // Adding citation posts
//       const { postID } = citation
//       if (citationPostsMap[postID]) {
//         continue
//       }
//       const citationPost = await TwitterPostModel.findOne({
//         postID,
//       })
//       citationPostsMap[postID] = citationPost
//       if (!citationPost) {
//         continue
//       }

//       // Adding citation minters
//       const { twitterUsername } = citationPost
//       if (citationMintersMap[twitterUsername]) {
//         continue
//       }
//       const minter = await UserTokenModel.findOne({
//         walletAddress: twitterUsername,
//       })
//       citationMintersMap[twitterUsername] = minter
//     }

//     const postOpinionWithPost = mapPostOpinionWithPost({
//       post: posts[0],
//       postOpinion,
//       citationPostsMap,
//       citationMintersMap,
//     })
//     if (postOpinionWithPost) {
//       postOpinionsWithPost.push(postOpinionWithPost)
//     }
//   }

//   // Filter the post opinions based on search keyword
//   // (search in post content, comment and minter address)
//   const filteredPostOpinionsByWallet = postOpinionsWithPost.filter(
//     (postOpinionWithPost) =>
//       (postOpinionWithPost.content ?? '')
//         .toLowerCase()
//         .includes((search ?? '').toLowerCase()) ||
//       (postOpinionWithPost.comment
//         ? postOpinionWithPost.comment
//             .toLowerCase()
//             .includes((search ?? '').toLowerCase())
//         : false) ||
//       (postOpinionWithPost.twitterUsername ?? '')
//         .toLowerCase()
//         .includes((search ?? '').toLowerCase()) ||
//       (postOpinionWithPost.minterToken?.username ?? '')
//         .toLowerCase()
//         .includes((search ?? '').toLowerCase())
//   )

//   const postOpinionsByWallet = filteredPostOpinionsByWallet
//     .sort((a, b) => compareFn(a, b, orderBy, orderDirection))
//     .slice(skip, skip + limit)

//   return { postOpinions: postOpinionsByWallet }
// }

// async function fetchAllPostOpinionsByWalletFromWeb2({
//   walletAddress,
//   options,
// }: {
//   walletAddress: string
//   options: TwitterPostOpinionsQueryOptions
// }) {
//   const { filterTokens } = options
//   const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
//   filterOptions.push({ ratedBy: walletAddress })
//   if (filterTokens.length > 0) {
//     filterOptions.push({ postID: { $in: filterTokens } })
//   }

//   return NFTOpinionModel.find({ $and: filterOptions }).sort({ _id: -1 })
// }

// async function fetchLatestPostOpinionsByWalletFromWeb2({
//   walletAddress,
//   options,
// }: {
//   walletAddress: string
//   options: TwitterPostOpinionsQueryOptions
// }) {
//   const { filterTokens } = options
//   const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
//   filterOptions.push({ ratedBy: walletAddress })
//   if (filterTokens.length > 0) {
//     filterOptions.push({ postID: { $in: filterTokens } })
//   }

//   return NFTOpinionModel.aggregate([
//     { $match: { $and: filterOptions } },
//     { $sort: { ratedAt: -1, _id: -1 } },
//     {
//       $group: {
//         _id: '$postID',
//         doc: { $first: '$$ROOT' },
//       },
//     },
//     { $replaceRoot: { newRoot: '$doc' } },
//   ]).sort({ _id: -1 })
// }

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

    if (twitterPost.postID) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const updatedPost = await TwitterPostModel.findOneAndUpdate(
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
    return
  } catch (error) {
    console.error('Error occurred while updating Twitter post', error)
    return await Promise.resolve(null)
  }
}

// export async function fetchPostCompositeRatingsFromWeb2({
//   postId,
//   postID,
//   startDate,
//   endDate,
// }: {
//   postId: string | null
//   postID: number | null
//   startDate: Date
//   endDate: Date
// }) {
//   try {
//     if (!postId && !postID) {
//       throw new BadRequestError('Either postID or postId is required')
//     }
//     // Filter Options
//     const filterOptions: FilterQuery<CompositeRatingDocument>[] = []
//     filterOptions.push({ timestamp: { $gt: startDate, $lt: endDate } })
//     if (postId) {
//       filterOptions.push({ post: new mongoose.Types.ObjectId(postId) })
//     } else {
//       filterOptions.push({ postID })
//     }
//     // Filter Query
//     let filterQuery = {}
//     if (filterOptions.length > 0) {
//       filterQuery = { $and: filterOptions }
//     }

//     const compositeRatings = await CompositeRatingModel.aggregate([
//       { $match: filterQuery },
//       { $sort: { timestamp: -1 } },
//       {
//         $group: {
//           _id: '$date',
//           doc: { $last: '$$ROOT' },
//         },
//       },
//       { $replaceRoot: { newRoot: '$doc' } },
//     ])

//     return compositeRatings.map((compositeRating) =>
//       mapCompositeRating(compositeRating)
//     )
//   } catch (error) {
//     console.error(
//       'Error occurred while fetching composite ratings of the post from web2',
//       error
//     )
//     throw new InternalServerError('Failed to fetch composite ratings from web2')
//   }
// }

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
