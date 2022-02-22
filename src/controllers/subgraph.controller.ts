import type { Request, Response } from 'express'
import type { OnchainTokens } from 'types/listing.types'

import { handleError, handleSuccess } from '../lib/base'
import {
  copyNewOnchainTokensToWeb2,
  executeSubgraphQuery,
} from '../services/subgraph.service'

export async function querySubgraph(req: Request, res: Response) {
  try {
    const query = req.body.query as string
    return handleSuccess(res, await executeSubgraphQuery<OnchainTokens>(query))
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
