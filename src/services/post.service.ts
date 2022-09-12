/* eslint-disable require-atomic-updates */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable unicorn/no-keyword-prefix */
/* eslint-disable sonarjs/no-duplicate-string */
import config from 'config'
import escapeStringRegexp from 'escape-string-regexp'
import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import type { CompositeRatingDocument } from '../models/composite-rating-model'
import { CompositeRatingModel } from '../models/composite-rating-model'
import type { Citation, NFTOpinionDocument } from '../models/nft-opinion.model'
import { NFTOpinionModel } from '../models/nft-opinion.model'
import { PostCitedByModel } from '../models/post-citedby-model'
import type { PostDocument } from '../models/post.model'
import { PostModel } from '../models/post.model'
import type { TriggerDocument } from '../models/trigger.model'
import { TriggerModel, TriggerType } from '../models/trigger.model'
import type { UserTokenDocument } from '../models/user-token.model'
import { UserTokenModel } from '../models/user-token.model'
import type { Web3NFTOpinionData } from '../types/nft-opinion.types'
import type {
  CitationTokenIds,
  PostCitationsQueryOptions,
  PostCitedByQueryOptions,
  PostOpinionsQueryOptions,
  PostQueryOptions,
  Web3IdeamarketPost,
} from '../types/post.types'
import { compareFn } from '../util'
import { mapCompositeRating } from '../util/compositeRatingsUtil'
import {
  mapPostOpinionResponse,
  mapPostOpinionWithPost,
  mapPostResponse,
} from '../util/postUtil'
import { web3 } from '../web3/contract'
import { getDeployedAddresses } from '../web3/deployedAddresses'
import { getOpinionsSummaryOfNFT } from '../web3/opinions/nft-opinions'
import {
  getAllIdeamarketPosts,
  getIdeamarketPostByTokenID,
} from '../web3/posts'
import { BadRequestError, InternalServerError } from './errors'

const NETWORK = config.get<string>('web3.network')

export async function fetchAllPostsFromWeb2({
  contractAddress: _contractAddress,
  options,
}: {
  contractAddress: string | null | undefined
  options: PostQueryOptions
}) {
  const contractAddress =
    _contractAddress ?? getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  const {
    skip,
    limit,
    orderBy,
    minterAddress,
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
  const filterOptions: FilterQuery<PostDocument & UserTokenDocument>[] = []
  filterOptions.push({ contractAddress })
  if (categories.length > 0) {
    filterOptions.push({ categories: { $in: categories } })
  }
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenID: { $in: filterTokens } })
  }
  if (minterAddress) {
    filterOptions.push({ minterAddress })
  }
  if (search) {
    filterOptions.push({
      $or: [
        { content: { $regex: escapeStringRegexp(search), $options: 'i' } },
        {
          minterAddress: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
        { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
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

  const posts = await PostModel.aggregate([
    {
      $lookup: {
        from: 'usertokens',
        localField: 'minterAddress',
        foreignField: 'walletAddress',
        as: 'UserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    { $set: { username: '$userToken.username' } },
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
        citationTokenIds: null,
      })
    )
  )
}

export async function fetchPostFromWeb2({
  tokenID,
  content,
}: {
  tokenID: number | null
  content: string | null
}) {
  if (!tokenID && !content) {
    return null
  }

  const contractAddress = getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }
  const filterOptions: FilterQuery<PostDocument>[] = []
  filterOptions.push({ contractAddress })
  if (tokenID) {
    filterOptions.push({ tokenID })
  }
  if (content) {
    filterOptions.push({ content })
  }

  // Filter Query
  const filterQuery = { $and: filterOptions }

  const posts = await PostModel.aggregate([
    { $match: filterQuery },
    {
      $lookup: {
        from: 'usertokens',
        localField: 'minterAddress',
        foreignField: 'walletAddress',
        as: 'UserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
  ])

  // const post = await PostModel.findOne({ contractAddress, tokenID })
  return mapPostResponse(posts[0])
}

export async function fetchPostCitationsFromWeb2({
  contractAddress: _contractAddress,
  tokenID,
  options,
  addCitationsOfCitations,
}: {
  contractAddress: string | null | undefined
  tokenID: number
  options: PostCitationsQueryOptions
  addCitationsOfCitations: boolean
}) {
  const contractAddress =
    _contractAddress ?? getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }
  const { latest, skip, limit, orderBy } = options

  const citationTokenIds = latest
    ? await fetchLatestPostCitationsTokenIds({
        contractAddress,
        tokenID,
      })
    : await fetchAllPostCitationsTokenIds({
        contractAddress,
        tokenID,
      })

  // Sorting Options
  const sortOptions: any = {}
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1
  sortOptions[orderBy] = orderDirection
  sortOptions._id = -1

  const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
  filterOptions.push(
    { contractAddress },
    {
      tokenID: {
        $in: [
          ...citationTokenIds.forCitationsTokenIds,
          ...citationTokenIds.againstCitationsTokenIds,
        ],
      },
    }
  )

  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const citationPosts = await PostModel.aggregate([
    {
      $lookup: {
        from: 'usertokens',
        localField: 'minterAddress',
        foreignField: 'walletAddress',
        as: 'UserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
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
            citationTokenIds,
          })
        : mapPostResponse(post, citationTokenIds)
    )
  )
}

async function fetchAdditionalPostDataAndMap({
  post,
  addCitationsOfCitations,
  citationTokenIds,
}: {
  post: any
  addCitationsOfCitations: boolean
  citationTokenIds: CitationTokenIds
}) {
  const topCitations = await fetchPostCitationsFromWeb2({
    contractAddress: null,
    tokenID: post.tokenID,
    options: {
      latest: true,
      skip: 0,
      limit: 3,
      orderBy: 'marketInterest', // TODO: order by new citation rating thing
      orderDirection: 'desc',
    },
    addCitationsOfCitations,
  })
  post.topCitations = topCitations

  const topRatings = await fetchPostOpinionsByTokenIdFromWeb2({
    contractAddress: null,
    tokenID: post.tokenID,
    options: {
      latest: true,
      skip: 0,
      limit: 10,
      orderBy: 'deposits',
      orderDirection: 'desc',
      search: '',
      filterTokens: [],
    },
  })
  post.topRatings = topRatings.postOpinions

  return mapPostResponse(post, citationTokenIds)
}

export async function fetchAllPostCitationsTokenIds({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const opinions = await NFTOpinionModel.find({ contractAddress, tokenID })
  const forCitationsSet = new Set<number>()
  const againstCitationsSet = new Set<number>()

  for (const opinion of opinions) {
    for (const citation of opinion.citations) {
      if (citation.inFavor) {
        forCitationsSet.add(citation.tokenID)
      } else {
        againstCitationsSet.add(citation.tokenID)
      }
    }
  }

  return {
    forCitationsTokenIds: [...forCitationsSet],
    againstCitationsTokenIds: [...againstCitationsSet],
  }
}

export async function fetchLatestPostCitationsTokenIds({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const opinions: NFTOpinionDocument[] = await NFTOpinionModel.aggregate([
    { $match: { contractAddress, tokenID } },
    { $sort: { ratedAt: -1, _id: -1 } },
    {
      $group: {
        _id: '$ratedBy',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ])

  const forCitationsSet = new Set<number>()
  const againstCitationsSet = new Set<number>()

  for (const opinion of opinions) {
    for (const citation of opinion.citations) {
      if (citation.inFavor) {
        forCitationsSet.add(citation.tokenID)
      } else {
        againstCitationsSet.add(citation.tokenID)
      }
    }
  }

  return {
    forCitationsTokenIds: [...forCitationsSet],
    againstCitationsTokenIds: [...againstCitationsSet],
  }
}

export async function fetchCitedByPostsService({
  contractAddress: _contractAddress,
  tokenID,
  options,
}: {
  contractAddress: string | null | undefined
  tokenID: number
  options: PostCitedByQueryOptions
}) {
  try {
    const contractAddress =
      _contractAddress ?? getIdeamarketPostsContractAddress()
    if (!contractAddress) {
      console.error('Deployed address is missing for ideamarket posts')
      throw new InternalServerError(
        'Contract address is missing for ideamamrket posts '
      )
    }
    const postCitedBy = await PostCitedByModel.findOne({
      contractAddress,
      tokenID,
    })
    if (!postCitedBy) {
      return []
    }

    const citedByTokenIds = postCitedBy.citedBy

    const { skip, limit, orderBy } = options

    // Sorting Options
    const sortOptions: any = {}
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1
    sortOptions[orderBy] = orderDirection
    sortOptions._id = -1

    // Filter Options
    const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
    filterOptions.push(
      { contractAddress },
      { tokenID: { $in: citedByTokenIds } }
    )
    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const citedByPosts = await PostModel.aggregate([
      {
        $lookup: {
          from: 'usertokens',
          localField: 'minterAddress',
          foreignField: 'walletAddress',
          as: 'UserTokens',
        },
      },
      { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
      { $match: filterQuery },
    ])
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return citedByPosts.map((post) => mapPostResponse(post))
  } catch (error) {
    console.error('Error occurred while fetching citedBy posts', error)
    throw new InternalServerError('Failed to fetch citedBy posts')
  }
}

export async function fetchPostOpinionsByTokenIdFromWeb2({
  contractAddress: _contractAddress,
  tokenID,
  options,
}: {
  contractAddress: string | null | undefined
  tokenID: number
  options: PostOpinionsQueryOptions
}) {
  const contractAddress =
    _contractAddress ?? getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  const { latest } = options

  const postOpinions = latest
    ? await fetchLatestPostOpinionsByTokenIdFromWeb2({
        contractAddress,
        tokenID,
        options,
      })
    : await fetchAllPostOpinionsByTokenIdFromWeb2({
        contractAddress,
        tokenID,
        options,
      })

  return {
    contractAddress,
    tokenID,
    postOpinions,
  }
}

async function fetchAllPostOpinionsByTokenIdFromWeb2({
  contractAddress,
  tokenID,
  options,
}: {
  contractAddress: string
  tokenID: number
  options: PostOpinionsQueryOptions
}) {
  const { skip, limit, orderBy, search } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  // Filter Options
  const filterOptions: FilterQuery<NFTOpinionDocument & UserTokenDocument>[] =
    []
  filterOptions.push({ contractAddress, tokenID })
  if (search) {
    filterOptions.push({
      $or: [
        { comment: { $regex: escapeStringRegexp(search), $options: 'i' } },
        { ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' } },
        { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const postOpinions = await NFTOpinionModel.aggregate([
    {
      $lookup: {
        from: 'usertokens',
        localField: 'ratedBy',
        foreignField: 'walletAddress',
        as: 'UserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    { $set: { username: '$userToken.username' } },
    { $set: { deposits: '$userToken.deposits' } },
    { $match: filterQuery },
  ])
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  const citationPostsMap: Record<number, PostDocument | null> = {}
  const citationMintersMap: Record<string, UserTokenDocument | null> = {}
  for await (const postOpinion of postOpinions) {
    const citations = postOpinion.citations as Citation[]
    for await (const citation of citations) {
      // Adding citation posts
      const { tokenID } = citation
      if (citationPostsMap[tokenID]) {
        continue
      }
      const citationPost = await PostModel.findOne({ contractAddress, tokenID })
      citationPostsMap[tokenID] = citationPost
      if (!citationPost) {
        continue
      }

      // Adding citation minters
      const { minterAddress } = citationPost
      if (citationMintersMap[minterAddress]) {
        continue
      }
      const minter = await UserTokenModel.findOne({
        walletAddress: minterAddress,
      })
      citationMintersMap[minterAddress] = minter
    }
  }

  return postOpinions.map((postOpinion) =>
    mapPostOpinionResponse(postOpinion, citationPostsMap, citationMintersMap)
  )
}

async function fetchLatestPostOpinionsByTokenIdFromWeb2({
  contractAddress,
  tokenID,
  options,
}: {
  contractAddress: string
  tokenID: number
  options: PostOpinionsQueryOptions
}) {
  const { skip, limit, orderBy, search } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  // Filter Options
  const filterOptions: FilterQuery<NFTOpinionDocument & UserTokenDocument>[] =
    []
  filterOptions.push({ contractAddress, tokenID })
  if (search) {
    filterOptions.push({
      $or: [
        { comment: { $regex: escapeStringRegexp(search), $options: 'i' } },
        { ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' } },
        { username: { $regex: escapeStringRegexp(search), $options: 'i' } },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const postOpinions = await NFTOpinionModel.aggregate([
    {
      $lookup: {
        from: 'usertokens',
        localField: 'ratedBy',
        foreignField: 'walletAddress',
        as: 'UserTokens',
      },
    },
    { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    { $set: { username: '$userToken.username' } },
    { $set: { deposits: '$userToken.deposits' } },
    { $match: filterQuery },
    { $sort: { ratedAt: -1, _id: -1 } },
    {
      $group: {
        _id: '$ratedBy',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ])
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  const citationPostsMap: Record<number, PostDocument | null> = {}
  const citationMintersMap: Record<string, UserTokenDocument | null> = {}
  for await (const postOpinion of postOpinions) {
    const citations = postOpinion.citations as Citation[]
    for await (const citation of citations) {
      // Adding citation posts
      const { tokenID } = citation
      if (citationPostsMap[tokenID]) {
        continue
      }
      const citationPost = await PostModel.findOne({ contractAddress, tokenID })
      citationPostsMap[tokenID] = citationPost
      if (!citationPost) {
        continue
      }

      // Adding citation minters
      const { minterAddress } = citationPost
      if (citationMintersMap[minterAddress]) {
        continue
      }
      const minter = await UserTokenModel.findOne({
        walletAddress: minterAddress,
      })
      citationMintersMap[minterAddress] = minter
    }
  }

  return postOpinions.map((postOpinion) =>
    mapPostOpinionResponse(postOpinion, citationPostsMap, citationMintersMap)
  )
}

export async function fetchPostOpinionsByWalletFromWeb2({
  contractAddress: _contractAddress,
  walletAddress,
  options,
}: {
  contractAddress: string | null | undefined
  walletAddress: string
  options: PostOpinionsQueryOptions
}) {
  const contractAddress =
    _contractAddress ?? getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  const { latest, orderBy, orderDirection, skip, limit, search } = options
  const postOpinions = latest
    ? await fetchLatestPostOpinionsByWalletFromWeb2({
        contractAddress,
        walletAddress,
        options,
      })
    : await fetchAllPostOpinionsByWalletFromWeb2({
        contractAddress,
        walletAddress,
        options,
      })

  const postOpinionsWithPost = []
  for await (const postOpinion of postOpinions) {
    const posts = await PostModel.aggregate([
      { $match: { contractAddress, tokenID: postOpinion.tokenID } },
      {
        $lookup: {
          from: 'usertokens',
          localField: 'minterAddress',
          foreignField: 'walletAddress',
          as: 'UserTokens',
        },
      },
      { $set: { userToken: { $arrayElemAt: ['$UserTokens', 0] } } },
    ])

    const citationPostsMap: Record<number, PostDocument | null> = {}
    const citationMintersMap: Record<string, UserTokenDocument | null> = {}
    const citations = postOpinion.citations as Citation[]
    for await (const citation of citations) {
      // Adding citation posts
      const { tokenID } = citation
      if (citationPostsMap[tokenID]) {
        continue
      }
      const citationPost = await PostModel.findOne({
        contractAddress,
        tokenID,
      })
      citationPostsMap[tokenID] = citationPost
      if (!citationPost) {
        continue
      }

      // Adding citation minters
      const { minterAddress } = citationPost
      if (citationMintersMap[minterAddress]) {
        continue
      }
      const minter = await UserTokenModel.findOne({
        walletAddress: minterAddress,
      })
      citationMintersMap[minterAddress] = minter
    }

    const postOpinionWithPost = mapPostOpinionWithPost({
      post: posts[0],
      postOpinion,
      citationPostsMap,
      citationMintersMap,
    })
    if (postOpinionWithPost) {
      postOpinionsWithPost.push(postOpinionWithPost)
    }
  }

  // Filter the post opinions based on search keyword
  // (search in post content, comment and minter address)
  const filteredPostOpinionsByWallet = postOpinionsWithPost.filter(
    (postOpinionWithPost) =>
      (postOpinionWithPost.content ?? '')
        .toLowerCase()
        .includes((search ?? '').toLowerCase()) ||
      (postOpinionWithPost.comment
        ? postOpinionWithPost.comment
            .toLowerCase()
            .includes((search ?? '').toLowerCase())
        : false) ||
      (postOpinionWithPost.minterAddress ?? '')
        .toLowerCase()
        .includes((search ?? '').toLowerCase()) ||
      (postOpinionWithPost.minterToken?.username ?? '')
        .toLowerCase()
        .includes((search ?? '').toLowerCase())
  )

  const postOpinionsByWallet = filteredPostOpinionsByWallet
    .sort((a, b) => compareFn(a, b, orderBy, orderDirection))
    .slice(skip, skip + limit)

  return { postOpinions: postOpinionsByWallet }
}

async function fetchAllPostOpinionsByWalletFromWeb2({
  contractAddress,
  walletAddress,
  options,
}: {
  contractAddress: string
  walletAddress: string
  options: PostOpinionsQueryOptions
}) {
  const { filterTokens } = options
  const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
  filterOptions.push({ ratedBy: walletAddress }, { contractAddress })
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenID: { $in: filterTokens } })
  }

  return NFTOpinionModel.find({ $and: filterOptions }).sort({ _id: -1 })
}

async function fetchLatestPostOpinionsByWalletFromWeb2({
  contractAddress,
  walletAddress,
  options,
}: {
  contractAddress: string
  walletAddress: string
  options: PostOpinionsQueryOptions
}) {
  const { filterTokens } = options
  const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
  filterOptions.push({ ratedBy: walletAddress }, { contractAddress })
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenID: { $in: filterTokens } })
  }

  return NFTOpinionModel.aggregate([
    { $match: { $and: filterOptions } },
    { $sort: { ratedAt: -1, _id: -1 } },
    {
      $group: {
        _id: '$tokenID',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ]).sort({ _id: -1 })
}

export async function syncAllPostsInWeb2() {
  const contractAddress = getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  console.log('Fetching all the ideamarket posts')
  const allPosts = await getAllIdeamarketPosts()
  for await (const post of allPosts) {
    console.log(`Syncing post with tokenID=${post.tokenID}`)
    await updatePostInWeb2({
      post: {
        tokenID: post.tokenID,
        minter: post.minter.toLowerCase(),
        content: post.content,
        timestamp: post.timestamp.toString(),
        categories: post.categories,
        imageLink: '',
        isURL: false,
        urlContent: '',
      },
      contractAddress,
    })
  }
}

export async function syncPostInWeb2(tokenID: number) {
  const contractAddress = getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  const post = await getIdeamarketPostByTokenID(tokenID)

  if (!post) {
    console.error('Post does not exist in metadata DB')
    throw new InternalServerError('Post does not exist in metadata DB')
  }

  await updatePostInWeb2({
    post: {
      tokenID: post.tokenID,
      minter: post.minter.toLowerCase(),
      content: post.content,
      timestamp: post.timestamp.toString(),
      categories: post.categories,
      imageLink: '',
      isURL: false,
      urlContent: '',
    },
    contractAddress: contractAddress.toLowerCase(),
  })
}

async function updatePostInWeb2({
  post,
  contractAddress,
}: {
  post: Web3IdeamarketPost
  contractAddress: string
}) {
  try {
    const postedAt = new Date(post.timestamp)

    console.log(`Fetching post opinions summary for tokenID=${post.tokenID}`)
    const postOpinionsSummary = await getOpinionsSummaryOfNFT(post.tokenID)

    console.log(`Calculating composite rating for tokenID=${post.tokenID}`)
    const latestOpinions: Web3NFTOpinionData[] = []
    for await (const opinion of postOpinionsSummary.latestOpinions) {
      const block = await web3.eth.getBlock(opinion.blockHeight)
      latestOpinions.push({
        contractAddress,
        tokenID: opinion.tokenID,
        author: opinion.author.toLowerCase(),
        timestamp: block.timestamp.toString(),
        rating: opinion.rating,
        comment: opinion.comment,
        citations: opinion.citations,
      })
    }
    const { compositeRating, marketInterest } =
      await calculateCompositeRatingAndMarketInterest(latestOpinions)

    console.log(
      `Updating post and opinions summary for tokenID=${post.tokenID}`
    )
    const updatedPost = await PostModel.findOneAndUpdate(
      {
        contractAddress,
        tokenID: post.tokenID,
      },
      {
        $set: {
          contractAddress,
          tokenID: post.tokenID,
          minterAddress: post.minter,
          content: post.content,
          postedAt,
          categories: post.categories,
          imageLink: post.imageLink,
          isURL: post.isURL,
          urlContent: post.urlContent,
          averageRating: postOpinionsSummary.averageRating,
          compositeRating,
          marketInterest,
          totalRatingsCount: postOpinionsSummary.totalRatingsCount,
          latestRatingsCount: postOpinionsSummary.latestRatingsCount,
          totalCommentsCount: postOpinionsSummary.totalCommentsCount,
          latestCommentsCount: postOpinionsSummary.latestCommentsCount,
        },
      },
      { upsert: true, new: true }
    )

    console.log(`Updating composite rating for tokenID=${post.tokenID}`)
    const date = new Date()
    const compositeRatingDoc = CompositeRatingModel.build({
      post: updatedPost,
      tokenID: updatedPost.tokenID,
      rating: compositeRating,
      date: date.toISOString().split('T')[0],
      timestamp: date,
    })
    await CompositeRatingModel.create(compositeRatingDoc)

    return updatedPost
  } catch (error) {
    console.error(
      'Error occurred while syncing the post from web3 to web2',
      error
    )
    return await Promise.resolve(null)
  }
}

export async function fetchPostCompositeRatingsFromWeb2({
  postId,
  tokenID,
  startDate,
  endDate,
}: {
  postId: string | null
  tokenID: number | null
  startDate: Date
  endDate: Date
}) {
  try {
    if (!postId && !tokenID) {
      throw new BadRequestError('Either tokenID or postId is required')
    }
    // Filter Options
    const filterOptions: FilterQuery<CompositeRatingDocument>[] = []
    filterOptions.push({ timestamp: { $gt: startDate, $lt: endDate } })
    if (postId) {
      filterOptions.push({ post: new mongoose.Types.ObjectId(postId) })
    } else {
      filterOptions.push({ tokenID })
    }
    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const compositeRatings = await CompositeRatingModel.aggregate([
      { $match: filterQuery },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: '$date',
          doc: { $last: '$$ROOT' },
        },
      },
      { $replaceRoot: { newRoot: '$doc' } },
    ])

    return compositeRatings.map((compositeRating) =>
      mapCompositeRating(compositeRating)
    )
  } catch (error) {
    console.error(
      'Error occurred while fetching composite ratings of the post from web2',
      error
    )
    throw new InternalServerError('Failed to fetch composite ratings from web2')
  }
}

export function getIdeamarketPostsContractAddress() {
  const ideamarketPostsDeployedAddress =
    getDeployedAddresses(NETWORK)?.ideamarketPosts

  return ideamarketPostsDeployedAddress
    ? ideamarketPostsDeployedAddress.toLowerCase()
    : undefined
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

export async function resolveIdeamarketPostTrigger(trigger: TriggerDocument) {
  try {
    console.info(`Resolving trigger - ${trigger._id as string}`)

    const tokenID = trigger.triggerData.tokenID
      ? Number.parseInt(trigger.triggerData.tokenID as string)
      : null
    if (!tokenID) {
      console.error(
        `TriggerData is not valid for type = ${TriggerType.IDEAMARKET_POST}`
      )
      return
    }

    await syncPostInWeb2(tokenID)
    await TriggerModel.findByIdAndDelete(trigger._id)
    console.info(`Trigger - ${trigger._id as string} resolved`)
  } catch (error) {
    console.error(
      'Error occurred while resolving ideamarket post trigger',
      error
    )
  }
}
