import type { BlacklistedListingDocument } from '../models/blacklisted-listings.model'
import type { ListingDocument } from '../models/listing.model'
import type {
  BlacklistedListingResponse,
  ListingResponse,
  Web2TokenData,
  Web3TokenData,
} from '../types/listing.types'

export function mapWeb2Data(
  listingDoc: ListingDocument | null
): Web2TokenData | null {
  if (!listingDoc) {
    return null
  }

  const web2TokenData: Web2TokenData = {
    listingId: listingDoc._id,
    value: listingDoc.value,
    marketId: listingDoc.marketId,
    marketName: listingDoc.marketName,
    isOnChain: listingDoc.isOnchain,
    ghostListedBy:
      listingDoc.ghostListedByAccount?.username ?? listingDoc.ghostListedBy,
    ghostListedAt: listingDoc.ghostListedAt,
    onchainValue: listingDoc.onchainValue,
    onchainId: listingDoc.onchainId,
    onchainListedBy:
      listingDoc.onchainListedByAccount?.username ?? listingDoc.onchainListedBy,
    onchainListedAt: listingDoc.onchainListedAt,
    totalVotes: listingDoc.totalVotes,
  }

  return web2TokenData
}

export function combineWeb2AndWeb3TokenData({
  listingDoc,
  web3TokenData,
}: {
  listingDoc: ListingDocument | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null | undefined
}): ListingResponse {
  return {
    web2TokenData: mapWeb2Data(listingDoc),
    web3TokenData: web3TokenData ?? null,
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
