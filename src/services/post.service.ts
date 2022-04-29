/* eslint-disable unicorn/no-keyword-prefix */
/* eslint-disable sonarjs/no-duplicate-string */
import config from 'config'
import escapeStringRegexp from 'escape-string-regexp'
import type { FilterQuery } from 'mongoose'

import type { NFTOpinionDocument } from '../models/nft-opinion.model'
import { NFTOpinionModel } from '../models/nft-opinion.model'
import type { PostDocument } from '../models/post.model'
import { PostModel } from '../models/post.model'
import type {
  PostOpinionsQueryOptions,
  PostQueryOptions,
  Web3IdeamarketPost,
} from '../types/post.types'
import { compareFn } from '../util'
import {
  mapPostOpinionResponse,
  mapPostOpinionWithPost,
  mapPostResponse,
} from '../util/postUtil'
import { getDeployedAddresses } from '../web3/deployedAddresses'
import { getOpinionsSummaryOfNFT } from '../web3/opinions/nft-opinions'
import {
  getAllIdeamarketPosts,
  getIdeamarketPostByTokenID,
} from '../web3/posts'
import { InternalServerError } from './errors'

const NETWORK = config.get<string>('web3.network')

export async function fetchAllPostsFromWeb2(options: PostQueryOptions) {
  const { skip, limit, orderBy, search, categories, filterTokens } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection
  sortOptions._id = 1

  // Filter Options
  const filterOptions: FilterQuery<PostDocument>[] = []
  if (categories.length > 0) {
    filterOptions.push({ categories: { $in: categories } })
  }
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenID: { $in: filterTokens } })
  }
  if (search) {
    filterOptions.push({
      $or: [
        {
          content: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
        {
          minterAddress: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const posts = await PostModel.find(filterQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return posts.map((post) => mapPostResponse(post))
}

export async function fetchPostFromWeb2(tokenID: number) {
  const contractAddress = getIdeamarketPostsContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for ideamarket posts')
    throw new InternalServerError(
      'Contract address is missing for ideamamrket posts '
    )
  }

  const post = await PostModel.findOne({ contractAddress, tokenID })
  return mapPostResponse(post)
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
  const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
  filterOptions.push([{ contractAddress }, { tokenID }])
  if (search) {
    filterOptions.push({
      $or: [
        {
          comment: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
        {
          ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const postOpinions = await NFTOpinionModel.find(filterQuery)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return postOpinions.map((postOpinion) => mapPostOpinionResponse(postOpinion))
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
  const filterOptions: FilterQuery<NFTOpinionDocument>[] = []
  filterOptions.push({ contractAddress, tokenID })
  if (search) {
    filterOptions.push({
      $or: [
        {
          comment: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
        {
          ratedBy: { $regex: escapeStringRegexp(search), $options: 'i' },
        },
      ],
    })
  }

  // Filter Query
  let filterQuery = {}
  if (filterOptions.length > 0) {
    filterQuery = { $and: filterOptions }
  }

  const postOpinions = await NFTOpinionModel.aggregate([
    { $match: filterQuery },
    { $sort: { ratedAt: -1 } },
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

  return postOpinions.map((postOpinion) => mapPostOpinionResponse(postOpinion))
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
    const post = await PostModel.findOne({
      contractAddress,
      tokenID: postOpinion.tokenID,
    })
    const postOpinionWithPost = mapPostOpinionWithPost({ postOpinion, post })
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
      postOpinionWithPost.comment
        .toLowerCase()
        .includes((search ?? '').toLowerCase()) ||
      (postOpinionWithPost.minterAddress ?? '')
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
    { $sort: { ratedAt: -1 } },
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
    console.log(`Syncing post with tokenID=${post.tokenID as string}`)
    await updatePostInWeb2({
      post: {
        tokenID: post.tokenID,
        minter: post.minter,
        content: post.content,
        categories: post.categories,
        imageLink: post.imageLink,
        isURL: post.isURL,
        urlContent: post.urlContent,
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
  await updatePostInWeb2({
    post: {
      tokenID: post.tokenID,
      minter: post.minter.toLowerCase(),
      content: post.content,
      categories: post.categories,
      imageLink: post.imageLink,
      isURL: post.isURL,
      urlContent: post.urlContent,
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
    console.log(`Fetching post opinions summary for tokenID=${post.tokenID}`)
    const postOpinionsSummary = await getOpinionsSummaryOfNFT({
      contractAddress,
      tokenID: post.tokenID,
    })

    console.log(
      `Updating post and opinions summary for tokenID=${post.tokenID}`
    )
    return await PostModel.findOneAndUpdate(
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
          categories: post.categories,
          imageLink: post.imageLink,
          isURL: post.isURL,
          urlContent: post.urlContent,
          averageRating: postOpinionsSummary.averageRating,
          totalRatingsCount: postOpinionsSummary.totalRatingsCount,
          latestRatingsCount: postOpinionsSummary.latestRatingsCount,
          totalCommentsCount: postOpinionsSummary.totalCommentsCount,
          latestCommentsCount: postOpinionsSummary.latestCommentsCount,
        },
      },
      { upsert: true, new: true }
    )
  } catch (error) {
    console.error(
      'Error occurred while syncing the post from web3 to web2',
      error
    )
    return await Promise.resolve(null)
  }
}

export function getIdeamarketPostsContractAddress() {
  const ideamarketPostsDeployedAddress =
    getDeployedAddresses(NETWORK)?.ideamarketPosts

  return ideamarketPostsDeployedAddress
    ? ideamarketPostsDeployedAddress.toLowerCase()
    : undefined
}
