import config from 'config'
import type { Request, Response } from 'express'
import type { IGhostListing } from 'models/ghost-listing.model'
import type { DECODED_ACCOUNT } from 'util/jwtTokenUtil'

import { handleSuccess, handleError } from '../lib/base'
import ghost from '../services/ghost.service'

const INVALID_MARKET_TYPE_ERROR = 'Provided market type is invalid'

export async function fetchAllByMarket(req: Request, res: Response) {
  const { marketType } = req.params
  const marketId = Number.parseInt(req.query.marketId as string) || 0
  const page = Number.parseInt(req.query.page as string) || 0
  const count = Number.parseInt(req.query.count as string) || 50

  try {
    if (marketType === 'ghost') {
      return handleSuccess(
        res,
        await ghost.fetchAllByMarket(marketId, page, count)
      )
    }

    return handleError(
      res,
      INVALID_MARKET_TYPE_ERROR,
      INVALID_MARKET_TYPE_ERROR
    )
  } catch (error) {
    return handleError(res, error, `Unable to fetch ${marketType} listings`)
  }
}

export async function addToListing(req: Request, res: Response) {
  try {
    const { marketType } = req.params
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    if (marketType === 'ghost') {
      const ghostListingRequest: IGhostListing = {
        walletAddress: decodedAccount.walletAddress,
        marketName: config.get(`markets.${reqBody.marketId as number}`),
        marketId: reqBody.marketId as number,
        user: decodedAccount.id,
        value: req.body.value as string,
      }
      return handleSuccess(res, await ghost.addToListing(ghostListingRequest))
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