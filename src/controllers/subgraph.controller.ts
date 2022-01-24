import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import { executeSubgraphQuery } from '../services/subgraph.service'

export async function querySubgraph(req: Request, res: Response) {
  try {
    const query = req.body.query as string

    const data = await executeSubgraphQuery(query)

    return handleSuccess(res, data)
  } catch (error) {
    console.error('Error occurred while quering the subgraph', error)
    return handleError(res, error, 'Unable to query the subgraph')
  }
}
