import config from 'config'
import type { Request, Response } from 'express'
import type { IListing, ListingDocument } from 'models/listing.model'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import {
  addNewListing,
  migrateGhostToOnChainListing,
  fetchOnchainListings,
  fetchGhostListings,
  fetchAllListings,
} from '../services/listing.service'

const TOKEN_EXISTED_ERROR = 'Token has been already listed'

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

export async function addGhostListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const listingRequest: IListing = {
      ghostListedByAccount: decodedAccount.id,
      ghostListedBy: decodedAccount.walletAddress,
      marketName: config.get(`markets.market${reqBody.marketId as number}`),
      marketId: reqBody.marketId as number,
      value: req.body.value as string,
      ghostListedAt: new Date(),
      isOnChain: false,
      onchainId: null,
      onchainListedAt: null,
      onchainListedBy: null,
      onchainListedByAccount: null,
      totalVotes: 0,
    }

    const recentAddedListing = (await addNewListing(
      listingRequest
    )) as ListingDocument

    return handleSuccess(res, recentAddedListing)
  } catch (error) {
    console.error(error)
    return handleError(res, error, TOKEN_EXISTED_ERROR)
  }
}

export async function addOnChainListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const listingRequest: IListing = {
      ghostListedByAccount: null,
      ghostListedBy: null,
      ghostListedAt: null,
      marketName: config.get(`markets.market${reqBody.marketId as number}`),
      marketId: reqBody.marketId as number,
      value: req.body.value as string,
      isOnChain: true,
      onchainId: reqBody.onchainId as string,
      onchainListedAt: new Date(Number.parseInt(reqBody.listedAt) * 1000),
      onchainListedBy: decodedAccount.walletAddress,
      onchainListedByAccount: decodedAccount.id,
      totalVotes: 0,
    }

    const recentAddedListing = (await addNewListing(
      listingRequest
    )) as ListingDocument

    return handleSuccess(res, recentAddedListing)
  } catch (error) {
    console.error(error)
    return handleError(res, error, TOKEN_EXISTED_ERROR)
  }
}

export async function migrateGhostListingToOnChain(
  req: Request,
  res: Response
) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const listingRequest: IListing = {
      ghostListedByAccount: undefined,
      ghostListedBy: undefined,
      marketName: undefined,
      marketId: undefined,
      value: undefined,
      ghostListedAt: undefined,
      isOnChain: true,
      onchainId: reqBody.onchainId as string,
      onchainListedAt: new Date((reqBody.listedAt as number) * 1000),
      onchainListedBy: decodedAccount.walletAddress,
      onchainListedByAccount: decodedAccount.id,
      totalVotes: undefined,
    }

    const recentAddedListing = (await migrateGhostToOnChainListing(
      reqBody.listingId as string,
      listingRequest
    )) as ListingDocument

    return handleSuccess(res, recentAddedListing)
  } catch (error: any) {
    console.error(error)
    return handleError(
      res,
      error,
      error?.message || 'Unable to handle listing migration to onchain'
    )
  }
}
