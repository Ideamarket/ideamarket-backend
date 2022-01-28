import type { Request, Response } from 'express'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import {
  fetchOnchainListings,
  fetchGhostListings,
  fetchAllListings,
  addNewGhostListing,
  updateOrCloneOnchainListing,
  fetchSingleListing,
} from '../services/listing.service'

export async function fetchListings(req: Request, res: Response) {
  try {
    const marketType = req.query.marketType as string
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

    const options = {
      marketIds,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens,
      isVerifiedFilter,
      earliestPricePointTs,
    }

    if (marketType === 'onchain') {
      const onchainListings = await fetchOnchainListings(options)
      return handleSuccess(res, { listings: onchainListings })
    }

    if (marketType === 'ghost') {
      const ghostListings = await fetchGhostListings(options)
      return handleSuccess(res, { listings: ghostListings })
    }

    const allListings = await fetchAllListings(options)
    return handleSuccess(res, { listings: allListings })
  } catch (error) {
    console.error('Error occurred while fetching the listings', error)
    return handleError(res, error, 'Unable to fetch the listings')
  }
}

export async function fetchListing(req: Request, res: Response) {
  try {
    const marketId = Number.parseInt(req.query.marketId as string)
    const value = decodeURIComponent(req.query.value as string)

    const listing = await fetchSingleListing({ marketId, value })

    return handleSuccess(res, listing)
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
      value: reqBody.value,
      decodedAccount,
    })

    return handleSuccess(res, ghostListing)
  } catch (error) {
    console.error('Error occurred while adding ghost listing', error)
    return handleError(res, error, 'Unable to add ghost listing')
  }
}

export async function addOnChainListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const listing = await updateOrCloneOnchainListing({
      marketId: reqBody.marketId as number,
      value: reqBody.value,
      decodedAccount,
    })

    return handleSuccess(res, listing)
  } catch (error) {
    console.error('Error occurred while adding onchain listing', error)
    return handleError(res, error, 'Unable to add onchain listing')
  }
}
