/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable promise/prefer-await-to-then */
import config from 'config'
import { request } from 'graphql-request'
import type { FilterQuery } from 'mongoose'

import type { IListing, ListingDocument } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import type { OnchainTokens, Web3TokenData } from '../types/listing.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { combineWeb2AndWeb3TokenData, mapWeb2Data } from '../util/listingUtil'
import { getSingleTokenQuery, getTokensQuery } from '../util/queries'
import { SUBGRAPH_URL } from '../util/web3Util'
import { InternalServerError, ObjectAlreadyExistsError } from './errors'

export type ListingQueryOptions = {
  marketIds: number[]
  skip: number
  limit: number
  orderBy: string
  orderDirection: string
  filterTokens: string[]
  isVerifiedFilter: boolean
  earliestPricePointTs: number
}

export async function fetchAllListings(options: ListingQueryOptions) {
  const { orderBy, skip, limit, marketIds, filterTokens } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const filterOptions: FilterQuery<ListingDocument>[] = []
  filterOptions.push({ marketId: { $in: marketIds } })
  if (filterTokens.length > 0) {
    filterOptions.push({ _id: { $in: filterTokens } })
  }

  const web2Listings = await ListingModel.find({ $and: filterOptions })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  const onchainListingIds = web2Listings
    .filter((listing) => listing.isOnChain)
    .map((listing) => listing.onchainId)
  const onchainTokens: OnchainTokens = await request(
    SUBGRAPH_URL,
    getTokensQuery({
      ...options,
      skip: 0,
      orderBy: 'supply',
      filterTokens: onchainListingIds,
    })
  )
  const onchainListingsMap: Record<string, Web3TokenData> = {}
  for (const listing of onchainTokens.ideaTokens) {
    onchainListingsMap[listing.id] = listing
  }

  return web2Listings.map((listing) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: listing,
      web3TokenData: listing.isOnChain
        ? onchainListingsMap[listing.onchainId]
        : null,
    })
  )
}

export async function fetchOnchainListings(options: ListingQueryOptions) {
  const onchainTokens: OnchainTokens = await request(
    SUBGRAPH_URL,
    getTokensQuery(options)
  )

  return onchainTokens.ideaTokens.map((token) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: null,
      web3TokenData: token,
    })
  )
}

export async function fetchGhostListings(options: ListingQueryOptions) {
  const { orderBy, skip, limit, marketIds, filterTokens } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const filterOptions: FilterQuery<ListingDocument>[] = []
  filterOptions.push({ isOnChain: false }, { marketId: { $in: marketIds } })
  if (filterTokens.length > 0) {
    filterOptions.push({ _id: { $in: filterTokens } })
  }

  const ghostListings = await ListingModel.find({ $and: filterOptions })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('ghostListedByAccount')

  return ghostListings.map((listing) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: listing,
      web3TokenData: null,
    })
  )
}

export async function addNewGhostListing({
  marketId,
  value,
  decodedAccount,
}: {
  marketId: number
  value: string
  decodedAccount: DECODED_ACCOUNT
}) {
  const marketName: string = config.get(`markets.market${marketId}`)
  const listing = await ListingModel.findOne({ marketId, value })
  if (listing) {
    throw new ObjectAlreadyExistsError(null, 'Token has already been listed')
  }

  const listingDoc = ListingModel.build({
    value,
    marketId,
    marketName,
    isOnChain: false,
    ghostListedBy: decodedAccount.walletAddress,
    ghostListedByAccount: decodedAccount.id,
    ghostListedAt: new Date(),
    onchainId: null,
    onchainListedBy: null,
    onchainListedByAccount: null,
    onchainListedAt: null,
    totalVotes: 0,
  })
  const createdGhostListing = await (
    await ListingModel.create(listingDoc)
  ).populate('ghostListedByAccount')

  return mapWeb2Data(createdGhostListing)
}

export async function updateOrCloneOnchainListing({
  marketId,
  value,
  decodedAccount,
}: {
  marketId: number
  value: string
  decodedAccount: DECODED_ACCOUNT
}) {
  const marketName: string = config.get(`markets.market${marketId}`)
  const web3Data = await request(
    SUBGRAPH_URL,
    getSingleTokenQuery({ marketName, tokenName: value })
  )
  const [token] = web3Data.ideaMarkets[0].tokens
  if (!token) {
    console.error('Error occurred while fetching web3 data from subgraph')
    throw new InternalServerError('Failed to get web3 data from subgraph')
  }

  const listing = await ListingModel.findOne({ marketId, value })
  const listingDoc: IListing = {
    value,
    marketId,
    marketName,
    isOnChain: true,
    ghostListedBy: listing ? listing.ghostListedBy : null,
    ghostListedByAccount: listing ? listing.ghostListedByAccount?._id : null,
    ghostListedAt: listing ? listing.ghostListedAt : null,
    onchainId: token.id,
    onchainListedBy: token.tokenOwner,
    onchainListedByAccount: decodedAccount.id,
    onchainListedAt: new Date(token.listedAt * 1000),
    totalVotes: listing ? listing.totalVotes : 0,
  }
  const updatedOrClonedListing = await ListingModel.findOneAndUpdate(
    {
      marketId,
      value,
    },
    listingDoc,
    {
      new: true,
    }
  )
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  return mapWeb2Data(updatedOrClonedListing)
}

export function updateListingVoteCountById(id: string, totalVotes: number) {
  return new Promise((resolve, reject) => {
    ListingModel.findByIdAndUpdate(
      id,
      {
        totalVotes,
      },
      {
        new: true,
      }
    )
      .then((item) => {
        resolve(item)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
