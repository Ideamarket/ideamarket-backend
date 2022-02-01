/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/no-await-expression-member */
import { request } from 'graphql-request'
import type { FilterQuery } from 'mongoose'

import { BlacklistedListingModel } from '../models/blacklisted-listings.model'
import type { IListing, ListingDocument } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import type { OnchainTokens, Web3TokenData } from '../types/listing.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import {
  combineWeb2AndWeb3TokenData,
  mapBlacklistedListing,
  mapWeb2Data,
} from '../util/listingUtil'
import { getAllMarkets } from '../util/marketUtil'
import { getSingleTokenQuery, getTokensQuery } from '../util/queries'
import { SUBGRAPH_URL } from '../util/web3Util'
import {
  EntityNotFoundError,
  InternalServerError,
  ObjectAlreadyExistsError,
} from './errors'
import { checkUpVotedOrNot } from './vote.service'

export type ListingQueryOptions = {
  marketIds: number[]
  skip: number
  limit: number
  orderBy: string
  orderDirection: string
  filterTokens: string[]
  isVerifiedFilter: boolean
  earliestPricePointTs: number
  search: string | null
}

export async function fetchAllListings({
  options,
  account,
}: {
  options: ListingQueryOptions
  account: DECODED_ACCOUNT | null
}) {
  const { orderBy, skip, limit, marketIds, filterTokens, search } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const filterOptions: FilterQuery<ListingDocument>[] = []
  filterOptions.push({ marketId: { $in: marketIds } })
  if (filterTokens.length > 0) {
    filterOptions.push({ _id: { $in: filterTokens } })
  }
  if (search) {
    filterOptions.push({ value: { $regex: search, $options: 'i' } })
  }

  const web2Listings = await ListingModel.find({ $and: filterOptions })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  // Filtering blacklisted listings
  const listingIds = web2Listings.map((listing) => listing._id)
  const blacklistedListings = await BlacklistedListingModel.find({
    listing: { $in: listingIds },
  })
    .select(['listing'])
    .populate({ path: 'listing', select: ['id'] })
  const blackListedListingIds = new Set(
    blacklistedListings.map(
      (blacklistedListing) => blacklistedListing.listing.id
    )
  )
  const filteredWeb2Listings = web2Listings.filter(
    (listing) => !blackListedListingIds.has(listing.id)
  )
  // ------------------------------

  // Fetching web3 data for onchain listings
  const onchainListingIds = filteredWeb2Listings
    .filter((listing) => listing.isOnchain)
    .map((listing) => listing.onchainId)
  const onchainTokens: Partial<OnchainTokens> = await request(
    SUBGRAPH_URL,
    getTokensQuery({
      ...options,
      skip: 0,
      orderBy: 'supply',
      filterTokens: onchainListingIds,
    })
  )
  const tokens = search
    ? onchainTokens.tokenNameSearch
    : onchainTokens.ideaTokens
  const onchainListingsMap: Record<string, Web3TokenData> = {}
  if (tokens) {
    for (const listing of tokens) {
      onchainListingsMap[listing.id] = listing
    }
  }
  // ------------------------------

  const allListingsResponse = filteredWeb2Listings.map(async (listing) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: listing,
      upVoted: await checkUpVotedOrNot({
        listingId: listing.id,
        accountId: account ? account.id : null,
      }),
      web3TokenData: listing.isOnchain
        ? onchainListingsMap[listing.onchainId]
        : null,
    })
  )
  return Promise.all(allListingsResponse)
}

export async function fetchOnchainListings(options: ListingQueryOptions) {
  const { search } = options
  const onchainTokens: Partial<OnchainTokens> = await request(
    SUBGRAPH_URL,
    getTokensQuery(options)
  )

  const tokens = search
    ? onchainTokens.tokenNameSearch
    : onchainTokens.ideaTokens

  if (!tokens || tokens.length === 0) {
    return []
  }

  // Filtering blacklisted listings
  const onchainIds = tokens.map((token) => token.id)
  const blacklistedListings = await BlacklistedListingModel.find({
    onchainId: { $in: onchainIds },
  }).select(['onchainId'])
  const blacklistedOnchainIds = new Set(
    blacklistedListings
      .filter((listing) => !!listing.onchainId)
      .map((listing) => listing.onchainId)
  )
  const filteredTokens = tokens.filter(
    (token) => !blacklistedOnchainIds.has(token.id)
  )
  // ------------------------------

  const onchainListingsResponse = filteredTokens.map(async (token) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: null,
      upVoted: null,
      web3TokenData: token,
    })
  )
  return Promise.all(onchainListingsResponse)
}

export async function fetchGhostListings({
  options,
  account,
}: {
  options: ListingQueryOptions
  account: DECODED_ACCOUNT | null
}) {
  const { orderBy, skip, limit, marketIds, filterTokens, search } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const filterOptions: FilterQuery<ListingDocument>[] = []
  filterOptions.push({ isOnchain: false }, { marketId: { $in: marketIds } })
  if (filterTokens.length > 0) {
    filterOptions.push({ _id: { $in: filterTokens } })
  }
  if (search) {
    filterOptions.push({ value: { $regex: search, $options: 'i' } })
  }

  const ghostListings = await ListingModel.find({ $and: filterOptions })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('ghostListedByAccount')

  // Filtering blacklisted listings
  const listingIds = ghostListings.map((listing) => listing._id)
  const blacklistedListings = await BlacklistedListingModel.find({
    listing: { $in: listingIds },
  })
    .select(['listing'])
    .populate({ path: 'listing', select: ['id'] })
  const blackListedListingIds = new Set(
    blacklistedListings.map(
      (blacklistedListing) => blacklistedListing.listing.id
    )
  )
  const filteredGhostListings = ghostListings.filter(
    (listing) => !blackListedListingIds.has(listing.id)
  )
  // ------------------------------

  const ghostListingsResponse = filteredGhostListings.map(async (listing) =>
    combineWeb2AndWeb3TokenData({
      listingDoc: listing,
      upVoted: await checkUpVotedOrNot({
        listingId: listing.id,
        accountId: account ? account.id : null,
      }),
      web3TokenData: null,
    })
  )
  return Promise.all(ghostListingsResponse)
}

export async function fetchSingleListing({
  marketId,
  value,
  account,
}: {
  marketId: number
  value: string
  account: DECODED_ACCOUNT | null
}) {
  let web3TokenData = null
  const marketName = getAllMarkets()[marketId]

  const listingDoc = await ListingModel.findOne({ marketId, value })
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  if (listingDoc?.isOnchain && listingDoc.onchainValue) {
    const web3Data = await request(
      SUBGRAPH_URL,
      getSingleTokenQuery({ marketName, tokenName: listingDoc.onchainValue })
    )
    web3TokenData = web3Data.ideaMarkets[0].tokens[0] as Partial<Web3TokenData>
  }

  return combineWeb2AndWeb3TokenData({
    listingDoc,
    upVoted: listingDoc
      ? await checkUpVotedOrNot({
          listingId: listingDoc.id,
          accountId: account ? account.id : null,
        })
      : null,
    web3TokenData,
  })
}

export async function addNewGhostListing({
  marketId,
  value,
  account,
}: {
  marketId: number
  value: string
  account: DECODED_ACCOUNT
}) {
  const marketName = getAllMarkets()[marketId]
  const listing = await ListingModel.findOne({ marketId, value })
  if (listing) {
    throw new ObjectAlreadyExistsError(null, 'Token has already been listed')
  }

  const listingDoc = ListingModel.build({
    value,
    marketId,
    marketName,
    isOnchain: false,
    ghostListedBy: account.walletAddress,
    ghostListedByAccount: account.id,
    ghostListedAt: new Date(),
    onchainValue: null,
    onchainId: null,
    onchainListedBy: null,
    onchainListedByAccount: null,
    onchainListedAt: null,
    totalVotes: 0,
  })
  const createdGhostListing = await (
    await ListingModel.create(listingDoc)
  ).populate('ghostListedByAccount')

  return mapWeb2Data({ listingDoc: createdGhostListing, upVoted: false })
}

export async function updateOrCloneOnchainListing({
  marketId,
  value,
  onchainValue,
  account,
}: {
  marketId: number
  value: string
  onchainValue: string
  account: DECODED_ACCOUNT | null
}) {
  const marketName = getAllMarkets()[marketId]
  const web3Data = await request(
    SUBGRAPH_URL,
    getSingleTokenQuery({ marketName, tokenName: onchainValue })
  )
  const token = web3Data.ideaMarkets[0].tokens[0] as
    | Web3TokenData
    | null
    | undefined
  if (!token) {
    console.error('Error occurred while fetching web3 data from subgraph')
    throw new InternalServerError('Failed to get web3 data from subgraph')
  }

  const listing = await ListingModel.findOne({ marketId, value })
  const listingDoc: IListing = {
    value,
    marketId,
    marketName,
    isOnchain: true,
    ghostListedBy: listing ? listing.ghostListedBy : null,
    ghostListedByAccount: listing ? listing.ghostListedByAccount?._id : null,
    ghostListedAt: listing ? listing.ghostListedAt : null,
    onchainValue,
    onchainId: token.id,
    onchainListedBy: token.lister,
    onchainListedByAccount: account?.id ?? null,
    onchainListedAt: new Date(Number.parseInt(token.listedAt) * 1000),
    totalVotes: listing ? listing.totalVotes : 0,
  }

  const updatedOrClonedListing = await ListingModel.findOneAndUpdate(
    {
      marketId,
      value,
    },
    { $set: listingDoc },
    {
      upsert: true,
      new: true,
    }
  )
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  return mapWeb2Data({
    listingDoc: updatedOrClonedListing,
    upVoted: await checkUpVotedOrNot({
      listingId: updatedOrClonedListing.id,
      accountId: account ? account.id : null,
    }),
  })
}

export async function updateTotalVotesInListing({
  listingId,
  totalVotes,
}: {
  listingId: string
  totalVotes: number
}) {
  return ListingModel.findByIdAndUpdate(listingId, { $set: { totalVotes } })
}

export async function addBlacklistListing({
  listingId,
  onchainId,
  account,
}: {
  listingId: string | null
  onchainId: string | null
  account: DECODED_ACCOUNT
}) {
  const listingDoc = await ListingModel.findOne({
    $or: [{ _id: listingId }, { onchainId }],
  })
  if (!listingDoc) {
    throw new EntityNotFoundError('Listing', null)
  }

  const blacklistedListingDoc = BlacklistedListingModel.build({
    listing: listingDoc._id,
    onchainId: listingDoc.onchainId,
    blacklistedBy: account.id,
  })
  const blacklistedListing = await (
    await BlacklistedListingModel.create(blacklistedListingDoc)
  ).populate('blacklistedBy')

  return mapBlacklistedListing(blacklistedListing)
}

export async function fetchAllBlacklistedListings() {
  const blacklistedListings = await BlacklistedListingModel.find().populate({
    path: 'blacklistedBy',
    select: ['username'],
  })

  return blacklistedListings.map((blacklistedListing) =>
    mapBlacklistedListing(blacklistedListing)
  )
}

export async function deleteBlacklistedListing(listingId: string) {
  await BlacklistedListingModel.findOneAndDelete({ listing: listingId })
}
