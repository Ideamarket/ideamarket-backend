import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import { ListingModel } from '../models/listing.model'
import { executeSubgraphQuery } from '../services/subgraph.service'

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
    const query = req.body.query as string

    const data = await executeSubgraphQuery(query)

    const clonedTokens = data.ideaTokens.map((ideaToken) => {
      const clonedToken = ListingModel.build({
        ghostListedAt: null,
        ghostListedBy: null,
        ghostListedByAccount: null,
        isOnChain: true,
        marketId: ideaToken.market.id,
        marketName: ideaToken.market.name,
        onchainId: ideaToken.id,
        onchainListedAt: new Date(Number.parseInt(ideaToken.listedAt) * 1000),
        onchainListedBy: ideaToken.tokenOwner,
        onchainListedByAccount: null,
        value: ideaToken.name,
        totalVotes: 0,
      })
      return clonedToken.save()
    })
    await Promise.all(clonedTokens)

    return handleSuccess(res, data)
  } catch (error) {
    console.error(
      'Error occurred while cloning onchain listings to web2',
      error
    )
    return handleError(res, error, 'Unable to clone onchain listings to web2')
  }
}
