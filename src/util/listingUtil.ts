import type { BlacklistedListingDocument } from '../models/blacklisted-listings.model'
import type { ListingDocument } from '../models/listing.model'
import type {
  BlacklistedListingResponse,
  ListingResponse,
  NewListingResponse,
  Web2TokenData,
  Web3TokenData,
} from '../types/listing.types'
import { ZERO_ADDRESS } from './web3Util'

export function mapWeb2Data({
  listingDoc,
  upVoted,
}: {
  listingDoc: ListingDocument | null
  upVoted: boolean | null
}): Web2TokenData | null {
  if (!listingDoc) {
    return null
  }

  const web2TokenData: Web2TokenData = {
    listingId: listingDoc._id,
    value: listingDoc.value,
    marketId: listingDoc.marketId,
    marketName: listingDoc.marketName,
    isOnchain: listingDoc.isOnchain,
    ghostListedBy:
      listingDoc.ghostListedByAccount?.username ?? listingDoc.ghostListedBy,
    ghostListedAt: listingDoc.ghostListedAt,
    onchainValue: listingDoc.onchainValue,
    onchainId: listingDoc.onchainId,
    onchainListedBy:
      listingDoc.onchainListedByAccount?.username ?? listingDoc.onchainListedBy,
    onchainListedAt: listingDoc.onchainListedAt,
    totalVotes: listingDoc.totalVotes,
    upVoted,
  }

  return web2TokenData
}

export function combineWeb2AndWeb3TokenData({
  listingDoc,
  upVoted,
  web3TokenData,
}: {
  listingDoc: ListingDocument | null
  upVoted: boolean | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null | undefined
}): ListingResponse {
  return {
    web2TokenData: mapWeb2Data({ listingDoc, upVoted }),
    web3TokenData: web3TokenData ?? null,
  }
}

export function mapListingResponse({
  listingDoc,
  upVoted,
  web3TokenData,
}: {
  listingDoc: ListingDocument | any | null
  upVoted: boolean | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null
}): NewListingResponse | null {
  if (!listingDoc) {
    return null
  }

  return {
    listingId: listingDoc._id,
    value: listingDoc.value,
    marketId: listingDoc.marketId,
    marketName: listingDoc.marketName,
    categories: listingDoc.categories.map((category: any) => ({
      id: category._id,
      name: category.name,
    })),
    isOnchain: listingDoc.isOnchain,
    ghostListedBy:
      listingDoc.ghostListedByAccount?.username ?? listingDoc.ghostListedBy,
    ghostListedAt: listingDoc.ghostListedAt,
    onchainValue: listingDoc.onchainValue,
    onchainId: listingDoc.onchainId,
    onchainListedBy:
      listingDoc.onchainListedByAccount?.username ?? listingDoc.onchainListedBy,
    onchainListedAt: listingDoc.onchainListedAt,
    totalVotes: listingDoc.totalVotes,
    onchainOwner: listingDoc.onchainOwner || ZERO_ADDRESS,
    price: listingDoc.price || 0,
    dayChange: listingDoc.dayChange || 0,
    weekChange: listingDoc.weekChange || 0,
    deposits: listingDoc.deposits || 0,
    holders: listingDoc.holders || 0,
    yearIncome: listingDoc.yearIncome || 0,
    claimableIncome: listingDoc.claimableIncome || 0,
    verified: listingDoc.verified,
    averageRating: listingDoc.opinionsSummary?.averageRating ?? 0,
    latestRatingsCount: listingDoc.opinionsSummary?.latestRatingsCount ?? 0,
    latestCommentsCount: listingDoc.opinionsSummary?.latestCommentsCount ?? 0,
    upVoted,
    web3TokenData,
  }
}

export function mapBlacklistedListing(
  blacklistedListing: BlacklistedListingDocument
): BlacklistedListingResponse {
  return {
    listingId: blacklistedListing.listing._id,
    blacklistedBy: blacklistedListing.blacklistedBy?.username ?? null,
    blacklistedAt: blacklistedListing.createdAt,
  }
}
