import config from 'config'
import type { Request, Response } from 'express'
import type { IListing } from 'models/listing.model'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import { fetchByMarket, addNewListing } from '../services/listing.service'

const INVALID_MARKET_TYPE_ERROR = 'Provided market type is invalid'

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

export async function addListing(req: Request, res: Response) {
  try {
    const { marketType } = req.params
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    if (marketType === 'ghost') {
      const ghostListingRequest: IListing = {
        address: decodedAccount.walletAddress,
        marketName: config.get(`markets.MARKET${reqBody.marketId as number}`),
        marketId: reqBody.marketId as number,
        marketType,
        user: decodedAccount.id,
        value: req.body.value as string,
      }
      return handleSuccess(res, await addNewListing(ghostListingRequest))
    }

    return handleError(
      res,
      INVALID_MARKET_TYPE_ERROR,
      INVALID_MARKET_TYPE_ERROR
    )
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Already exist in listing')
  }
}
