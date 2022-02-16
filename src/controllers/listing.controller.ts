import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import type { ListingQueryOptions } from '../services/listing.service'
import {
  addNewGhostListing,
  updateOrCloneOnchainListing,
  fetchSingleListing,
  addBlacklistListing,
  fetchAllBlacklistedListings,
  deleteBlacklistedListing,
  fetchAllListings,
  updateAllOnchainListings,
} from '../services/listing.service'
import { normalize } from '../util'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

export async function fetchListings(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | undefined
    const marketType = req.query.marketType as string | null | undefined
    const marketIds = (req.query.marketIds as string)
      .split(',')
      .map((id) => Number.parseInt(id))
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as string
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const filterTokens =
      (req.query.filterTokens as string | undefined)?.split(',') ?? []
    const isVerifiedFilter = Boolean(req.query.isVerifiedFilter as string)
    const earliestPricePointTs =
      Number.parseInt(req.query.earliestPricePointTs as string) || 0
    const search = (req.query.search as string) || null
    const verified = req.query.verified
      ? (req.query.verified as string) === 'true'
      : null
    const categories =
      (req.query.categories as string | undefined)?.split(',') ?? []

    const options: ListingQueryOptions = {
      marketType: (marketType as 'onchain' | 'ghost' | null) ?? null,
      marketIds,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens,
      isVerifiedFilter,
      earliestPricePointTs,
      search,
      verified,
      categories,
    }

    const allListings = await fetchAllListings({
      options,
      account: decodedAccount ?? null,
    })

    return handleSuccess(res, { listings: allListings })
  } catch (error) {
    console.error('Error occurred while fetching the listings', error)
    return handleError(res, error, 'Unable to fetch the listings')
  }
}

export async function fetchListing(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | undefined
    const listingId = req.query.listingId as string | null | undefined
    const marketId = req.query.marketId
      ? Number.parseInt(req.query.marketId as string)
      : null
    const value = req.query.value ? decodeURI(req.query.value as string) : null
    const onchainValue = req.query.onchainValue
      ? decodeURI(req.query.onchainValue as string)
      : null

    const listing = await fetchSingleListing({
      listingId: listingId ?? null,
      marketId,
      value,
      onchainValue,
      account: decodedAccount ?? null,
    })

    return handleSuccess(res, { listing })
  } catch (error) {
    console.error('Error occurred while fetching the listing', error)
    return handleError(res, error, 'Unable to fetch the listing')
  }
}

export async function addGhostListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const ghostListing = await addNewGhostListing({
      marketId: reqBody.marketId as number,
      value: normalize(decodeURI(reqBody.value as string)),
      categoryId: reqBody.categoryId ?? null,
      account: decodedAccount,
    })

    return handleSuccess(res, ghostListing)
  } catch (error) {
    console.error('Error occurred while adding ghost listing', error)
    return handleError(res, error, 'Unable to add ghost listing')
  }
}

export async function addOnchainListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | undefined

    const listing = await updateOrCloneOnchainListing({
      marketId: reqBody.marketId as number,
      value: normalize(decodeURI(reqBody.value as string)),
      onchainValue: decodeURIComponent(reqBody.onchainValue as string),
      account: decodedAccount ?? null,
    })

    return handleSuccess(res, listing)
  } catch (error) {
    console.error('Error occurred while adding onchain listing', error)
    return handleError(res, error, 'Unable to add onchain listing')
  }
}

export async function updateOnchainListings(req: Request, res: Response) {
  try {
    await updateAllOnchainListings()

    return handleSuccess(res, {
      message: 'All onchain listings have been updated',
    })
  } catch (error) {
    console.error('Error occurred while updating all onchain listings', error)
    return handleError(res, error, 'Unable to add update all onchain listings')
  }
}

export async function addListingToBlacklist(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const blacklistedListing = await addBlacklistListing({
      listingId: reqBody.listingId ?? null,
      onchainId: reqBody.onchainId ?? null,
      account: decodedAccount,
    })

    return handleSuccess(res, { blacklistedListing })
  } catch (error) {
    console.error('Error occurred while adding listing to blacklist', error)
    return handleError(res, error, 'Unable to add listing to blacklist')
  }
}

export async function fetchBlacklistedListings(req: Request, res: Response) {
  try {
    const blacklistedListings = await fetchAllBlacklistedListings()

    return handleSuccess(res, { blacklistedListings })
  } catch (error) {
    console.error('Error occurred while fetching blacklisted listings', error)
    return handleError(res, error, 'Unable to fetch blacklisted listings')
  }
}

export async function removeListingFromBlacklist(req: Request, res: Response) {
  try {
    const reqBody = req.body
    await deleteBlacklistedListing(reqBody.listingId)
    return handleSuccess(res, {
      message: 'Listing has been removed from blacklist',
    })
  } catch (error) {
    console.error('Error occurred while removing listing from blacklist', error)
    return handleError(res, error, 'Unable to remove listing from blacklist')
  }
}
