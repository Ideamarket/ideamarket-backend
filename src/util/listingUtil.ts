import type { BlacklistedListingDocument } from '../models/blacklisted-listings.model'
import type { ListingDocument } from '../models/listing.model'
import type {
  BlacklistedListingResponse,
  ListingResponse,
  NewListingResponse,
  Web2TokenData,
  Web3TokenData,
} from '../types/listing.types'

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
  listingDoc: ListingDocument | null
  upVoted: boolean | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null
}): NewListingResponse | null {
  if (!listingDoc) {
    return null
  }

  return {
    listingId: listingDoc.id,
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
    price: listingDoc.price,
    dayChange: listingDoc.dayChange,
    weekChange: listingDoc.weekChange,
    deposits: listingDoc.deposits,
    holders: listingDoc.holders,
    yearIncome: listingDoc.yearIncome,
    claimableIncome: listingDoc.claimableIncome,
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
