/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable promise/prefer-await-to-then */
import { request } from 'graphql-request'
import type { FilterQuery } from 'mongoose'

import type { IListing, ListingDocument } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import type { OnchainTokens, Web3TokenData } from '../types/listing.types'
import { combineWeb2AndWeb3TokenData } from '../util/listingUtil'
import { getTokensQuery } from '../util/queries/getTokensQuery'
import { SUBGRAPH_URL } from '../util/web3Util'
import {
  EntityNotFoundError,
  ObjectAlreadyExistsError,
  IllegalStateError,
} from './errors'

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

export function addNewListing(model: IListing) {
  return new Promise((resolve, reject) => {
    ListingModel.findOne({
      value: model.value,
      marketId: model.marketId,
    })
      .then((m) => {
        if (m) {
          reject(
            new ObjectAlreadyExistsError(null, 'Token has been already listed')
          )
        } else {
          resolve(ListingModel.create(model))
        }
      })
      .then((item) => {
        resolve(item)
      })
      .catch((error) => {
        reject(error)
      })
  })
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

export function migrateGhostToOnChainListing(
  listingId: string,
  model: IListing
) {
  return new Promise((resolve, reject) => {
    ListingModel.findById(listingId)
      .then((m) => {
        if (m && !m.isOnChain) {
          return m
          // eslint-disable-next-line sonarjs/elseif-without-else
        } else if (m?.isOnChain) {
          throw new IllegalStateError(
            'Listing have been already migrated to onchain'
          )
        }

        throw new EntityNotFoundError(
          null,
          `listing not found by id ${listingId}`
        )
      })
      .then(() => {
        return ListingModel.findByIdAndUpdate(
          listingId,
          {
            onchainId: model.onchainId,
            isOnChain: true,
            onchainListedAt: model.onchainListedAt,
            onchainListedBy: model.onchainListedBy,
            onchainListedByAccount: model.onchainListedByAccount,
          },
          {
            new: true,
          }
        )
      })
      .then((item) => {
        resolve(item)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
