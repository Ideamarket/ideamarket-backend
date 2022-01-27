import config from 'config'
import type { Request, Response } from 'express'
import type { IListing, ListingDocument } from 'models/listing.model'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import {
  fetchByMarket,
  addNewListing,
  migrateGhostToOnChainListing,
} from '../services/listing.service'

const TOKEN_EXISTED_ERROR = 'Token has been already listed'

export async function fetchAllByMarket(req: Request, res: Response) {
  const { marketType } = req.params
  const marketId = Number.parseInt(req.query.marketId as string) || 0
  const skip = Number.parseInt(req.query.skip as string) || 0
  const limit = Number.parseInt(req.query.limit as string) || 50

  try {
    return handleSuccess(
      res,
      await fetchByMarket(marketType, marketId, skip, limit)
    )
  } catch (error) {
    return handleError(res, error, `Unable to fetch ${marketType} listings`)
  }
}

export async function addGhostListing(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const listingRequest: IListing = {
      ghostListedByAccount: decodedAccount.id,
      ghostListedBy: decodedAccount.walletAddress,
      marketName: config.get(`markets.MARKET${reqBody.marketId as number}`),
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
      marketName: config.get(`markets.MARKET${reqBody.marketId as number}`),
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
