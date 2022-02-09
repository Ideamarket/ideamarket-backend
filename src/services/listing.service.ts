/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable unicorn/no-await-expression-member */
import { request } from 'graphql-request'
import type { FilterQuery } from 'mongoose'

import { BlacklistedListingModel } from '../models/blacklisted-listings.model'
import type { IListing, ListingDocument } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import type { TriggerDocument } from '../models/trigger.model'
import { TriggerModel, TriggerType } from '../models/trigger.model'
import type { Web3TokenData } from '../types/listing.types'
import type { IdeaToken, PricePoint } from '../types/subgraph.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { mapBlacklistedListing, mapListingResponse } from '../util/listingUtil'
import { getAllMarkets, getTokenNameUrl } from '../util/marketUtil'
import {
  getTokensByMarketIdAndTokenNameQuery,
  getTokenQuery,
  getTokensByMarketIdAndTokenIdQuery,
} from '../util/queries'
import {
  calculateClaimableIncome,
  calculateDayChange,
  calculateMarketCap,
  calculatePrice,
  calculateYearIncome,
  SUBGRAPH_URL,
} from '../util/web3Util'
import {
  EntityNotFoundError,
  InternalServerError,
  ObjectAlreadyExistsError,
} from './errors'
import {
  fetchAllOnchainTokensFromWeb3,
  fetchSubgraphData,
} from './subgraph.service'
import { checkUpVotedOrNot } from './vote.service'

export type ListingQueryOptions = {
  marketType: 'onchain' | 'ghost' | null
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
  const { marketType, marketIds, skip, limit, orderBy, filterTokens, search } =
    options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection
  if (marketType !== 'ghost') {
    sortOptions.onchainListedAt = -1
  }
  if (marketType !== 'onchain') {
    sortOptions.ghostListedAt = -1
  }
  sortOptions._id = -1

  // Filtering Options
  const filterOptions: FilterQuery<ListingDocument>[] = []
  filterOptions.push({ marketId: { $in: marketIds } })
  if (marketType === 'onchain') {
    filterOptions.push({ isOnchain: true })
  }
  if (marketType === 'ghost') {
    filterOptions.push({ isOnchain: false })
  }
  if (filterTokens.length > 0) {
    filterOptions.push({ _id: { $in: filterTokens } })
  }
  if (search) {
    filterOptions.push({ value: { $regex: search, $options: 'i' } })
  }

  // Listings
  const listings = await ListingModel.find({ $and: filterOptions })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  // Filtering blacklisted listings
  const listingIds = listings.map((listing) => listing._id)
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
  const filteredListings = listings.filter(
    (listing) => !blackListedListingIds.has(listing.id)
  )

  // Formatting listings
  const listingsResponse = filteredListings.map(async (listing) =>
    mapListingResponse({
      listingDoc: listing,
      upVoted: await checkUpVotedOrNot({
        listingId: listing.id,
        accountId: account ? account.id : null,
      }),
      web3TokenData: null,
    })
  )
  return Promise.all(listingsResponse)
}

export async function fetchSingleListing({
  listingId,
  marketId,
  value,
  onchainValue,
  account,
}: {
  listingId: string | null
  marketId: number | null
  value: string | null
  onchainValue: string | null
  account: DECODED_ACCOUNT | null
}) {
  if (listingId) {
    return fetchListingById({ listingId, account })
  }

  if (marketId && value && onchainValue) {
    return fetchListingByMarketAndValue({
      marketId,
      value,
      onchainValue,
      account,
    })
  }

  return null
}

async function fetchListingById({
  listingId,
  account,
}: {
  listingId: string
  account: DECODED_ACCOUNT | null
}) {
  try {
    const listing = await ListingModel.findById(listingId)
      .populate('ghostListedByAccount')
      .populate('onchainListedByAccount')

    if (!listing) {
      return null
    }

    return mapListingResponse({
      listingDoc: listing,
      upVoted: await checkUpVotedOrNot({
        listingId: listing.id,
        accountId: account ? account.id : null,
      }),
      web3TokenData: listing.onchainId
        ? await fetchSubgraphData({
            marketId: listing.marketId,
            id: listing.onchainId,
          })
        : null,
    })
  } catch (error) {
    console.error('Error occurred while fetching listing from web2', error)
    throw new InternalServerError('Failed to fetch listing')
  }
}

async function fetchListingByMarketAndValue({
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
  let listing = null

  // Fetch listing data from web2 db
  listing = await ListingModel.findOne({ marketId, value })
    .populate('ghostListedByAccount')
    .populate('onchainListedByAccount')

  // Pull data from subgraph if web3 data is not present in web2 db
  if (!listing || !listing.isOnchain) {
    const onchainTokens = await request(
      SUBGRAPH_URL,
      getTokensByMarketIdAndTokenNameQuery({
        marketId,
        tokenName: onchainValue,
      })
    )
    const onchainIdeaToken = onchainTokens.ideaMarkets[0].tokens[0] as IdeaToken
    listing = await updateOnchainListing({
      ideaToken: onchainIdeaToken,
      updateIfExists: false,
    })
  }

  if (!listing) {
    console.info('Listing not present in web2 and web3')
    return null
  }

  return mapListingResponse({
    listingDoc: listing,
    upVoted: await checkUpVotedOrNot({
      listingId: listing.id,
      accountId: account ? account.id : null,
    }),
    web3TokenData: listing.onchainId
      ? await fetchSubgraphData({
          marketId: listing.marketId,
          id: listing.onchainId,
        })
      : null,
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
    price: 0,
    dayChange: 0,
    weekChange: 0,
    deposits: 0,
    holders: 0,
    yearIncome: 0,
    claimableIncome: 0,
  })
  const createdGhostListing = await (
    await ListingModel.create(listingDoc)
  ).populate('ghostListedByAccount')

  return mapListingResponse({
    listingDoc: createdGhostListing,
    upVoted: false,
    web3TokenData: null,
  })
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
    getTokenQuery({ marketName, tokenName: onchainValue })
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
    price: calculatePrice(token.latestPricePoint.price),
    dayChange: calculateDayChange(token.dayChange),
    weekChange: calculateWeekChange(token.pricePoints),
    deposits: calculateMarketCap(token.marketCap),
    holders: token.holders,
    yearIncome: calculateYearIncome(token.marketCap),
    claimableIncome: calculateClaimableIncome(),
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

  return mapListingResponse({
    listingDoc: updatedOrClonedListing,
    upVoted: await checkUpVotedOrNot({
      listingId: updatedOrClonedListing.id,
      accountId: account ? account.id : null,
    }),
    web3TokenData: null,
  })
}

export async function updateAllOnchainListings() {
  try {
    const allOnchainIdeaTokens: IdeaToken[] =
      await fetchAllOnchainTokensFromWeb3()

    const updatedListings = allOnchainIdeaTokens.map((ideaToken) =>
      updateOnchainListing({ ideaToken, updateIfExists: true })
    )

    await Promise.all(updatedListings)
  } catch (error) {
    console.error('Error occurred while updating all onchain listings', error)
    throw new InternalServerError('Failed to update all onchain listings')
  }
}

export async function updateOnchainListing({
  ideaToken,
  updateIfExists,
}: {
  ideaToken: IdeaToken
  updateIfExists: boolean
}) {
  try {
    const value = getTokenNameUrl({
      marketName: ideaToken.market.name,
      tokenName: ideaToken.name,
    })
    const listing = await ListingModel.findOne({
      marketId: ideaToken.market.id,
      value,
    })

    if (!updateIfExists && listing?.onchainValue) {
      return await Promise.resolve(null)
    }

    const listingDoc: IListing = {
      value: listing ? listing.value : value,
      marketId: ideaToken.market.id,
      marketName: ideaToken.market.name,
      isOnchain: true,
      ghostListedBy: listing ? listing.ghostListedBy : null,
      ghostListedByAccount: listing ? listing.ghostListedByAccount?._id : null,
      ghostListedAt: listing ? listing.ghostListedAt : null,
      onchainValue: ideaToken.name,
      onchainId: ideaToken.id,
      onchainListedBy: ideaToken.lister,
      onchainListedByAccount: listing?.onchainListedByAccount?._id ?? null,
      onchainListedAt: new Date(Number.parseInt(ideaToken.listedAt) * 1000),
      totalVotes: listing ? listing.totalVotes : 0,
      price: calculatePrice(ideaToken.latestPricePoint.price),
      dayChange: calculateDayChange(ideaToken.dayChange),
      weekChange: calculateWeekChange(ideaToken.pricePoints),
      deposits: calculateMarketCap(ideaToken.marketCap),
      holders: ideaToken.holders,
      yearIncome: calculateYearIncome(ideaToken.marketCap),
      claimableIncome: calculateClaimableIncome(),
    }

    return await ListingModel.findOneAndUpdate(
      {
        marketId: listingDoc.marketId,
        onchainValue: listingDoc.onchainValue,
      },
      { $set: listingDoc },
      {
        upsert: true,
        new: true,
      }
    )
  } catch (error) {
    console.error('Error occurred while updating onchain listing', error)
    return Promise.resolve(null)
  }
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

export async function resolveOnchainListingTriggers(
  triggers: TriggerDocument[]
) {
  for (const trigger of triggers) {
    await resolveOnchainListingTrigger(trigger)
  }
}

export async function resolveOnchainListingTrigger(trigger: TriggerDocument) {
  try {
    console.info(`Resolving trigger - ${trigger._id as string}`)
    const marketId = Number.parseInt(trigger.triggerData.marketId as string)
    const tokenId = Number.parseInt(trigger.triggerData.tokenId as string)
    if (!marketId || !tokenId) {
      console.error(
        `TriggerData is not valid for type = ${TriggerType.ONCHAIN_LISTING}`
      )
      return
    }

    const onchainTokens = await request(
      SUBGRAPH_URL,
      getTokensByMarketIdAndTokenIdQuery({ marketId, tokenId })
    )
    const ideaToken = onchainTokens.ideaMarkets[0].tokens[0] as IdeaToken

    await updateOnchainListing({ ideaToken, updateIfExists: true })
    await TriggerModel.findByIdAndDelete(trigger._id)
    console.info(`Trigger - ${trigger._id as string} resolved`)
  } catch (error) {
    console.error('Error occurred while resolving ghost listing trigger', error)
  }
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

export function calculateWeekChange(weeklyPricePoints: PricePoint[]) {
  let weeklyChange = '0'
  if (weeklyPricePoints?.length > 0) {
    const yearlyCurrentPrice = Number(
      weeklyPricePoints[weeklyPricePoints.length - 1].price
    )

    const yearlyOldPrice = Number(weeklyPricePoints[0].oldPrice)
    weeklyChange = Number(
      ((yearlyCurrentPrice - yearlyOldPrice) * 100) / yearlyOldPrice
    ).toFixed(2)
  }
  return Number.parseFloat(weeklyChange)
}
