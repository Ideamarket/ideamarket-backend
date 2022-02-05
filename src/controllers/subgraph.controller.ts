import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  cloneOnchainTokensToWeb2,
  executeSubgraphQuery,
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

export async function cloneOnChainListingsToWeb2(req: Request, res: Response) {
  try {
    const response = await cloneOnchainTokensToWeb2()

    return handleSuccess(res, {
      message: 'All onchain listings have been cloned to web2',
      ...response,
    })
  } catch (error) {
    console.error(
      'Error occurred while cloning onchain listings to web2',
      error
    )
    return handleError(res, error, 'Unable to clone onchain listings to web2')
  }
}
