import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  copyNewOnchainTokensToWeb2,
  executeSubgraphQuery,
  fetchTradesFromSubgraph,
  fetchWalletHoldingsFromSubgraph,
} from '../services/subgraph.service'

export async function querySubgraph(req: Request, res: Response) {
  try {
    const query = req.body.query as string
    return handleSuccess(res, await executeSubgraphQuery(query))
  } catch (error) {
    console.error('Error occurred while quering the subgraph', error)
    return handleError(res, error, 'Unable to query the subgraph')
  }
}

export async function cloneNewOnchainListingsToWeb2(
  req: Request,
  res: Response
) {
  try {
    const response = await copyNewOnchainTokensToWeb2()

    return handleSuccess(res, {
      message: 'All new onchain listings have been copied to web2',
      ...response,
    })
  } catch (error) {
    console.error(
      'Error occurred while copying new onchain listings to web2',
      error
    )
    return handleError(
      res,
      error,
      'Unable to copy new onchain listings to web2'
    )
  }
}

export async function fetchWalletHoldings(req: Request, res: Response) {
  try {
    const owner = req.query.owner as string
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
    const search = (req.query.search as string) || null
    const locked = req.query.locked
      ? (req.query.locked as string) === 'true'
      : null

    const walletHoldings = await fetchWalletHoldingsFromSubgraph({
      owner,
      options: {
        marketIds,
        skip,
        limit,
        orderBy,
        orderDirection,
        filterTokens,
        search,
        locked,
      },
    })

    return handleSuccess(res, walletHoldings)
  } catch (error) {
    console.error('Error occurred while fetching wallet holdings', error)
    return handleError(res, error, 'Unable to fetch wallet holdings')
  }
}

export async function fetchTrades(req: Request, res: Response) {
  try {
    const owner = req.query.owner as string
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
    const search = (req.query.search as string) || null

    const trades = await fetchTradesFromSubgraph({
      owner,
      options: {
        marketIds,
        skip,
        limit,
        orderBy,
        orderDirection,
        filterTokens,
        search,
      },
    })

    return handleSuccess(res, trades)
  } catch (error) {
    console.error('Error occurred while fetching trades', error)
    return handleError(res, error, 'Unable to fetch trades')
  }
}
