import config from 'config'
import { gql, request } from 'graphql-request'

import { ListingModel } from '../models/listing.model'
import type { OnchainTokens } from '../types/listing.types'
import type { IdeaTokens } from '../types/subgraph.types'
import { getTokenNameUrl } from '../util/marketUtil'
import { getAllTokensQuery } from '../util/queries/getAllTokensQuery'
import { EntityNotFoundError, InternalServerError } from './errors'

const NETWORK: string = config.get('web3.network')
const SUBGRAPH_URL: string = config.get(`web3.subgraphUrls.${NETWORK}`)

export async function executeSubgraphQuery(
  query: string
): Promise<OnchainTokens> {
  return request(
    SUBGRAPH_URL,
    gql`
      ${query}
    `
  )
}

export async function cloneOnchainTokensToWeb2() {
  let onchainListings: IdeaTokens = {
    ideaTokens: [],
  }

  try {
    onchainListings = await request(SUBGRAPH_URL, getAllTokensQuery())
  } catch (error) {
    console.error(
      'Error occurred while fetching onchain listings from subgraph',
      error
    )
    throw new InternalServerError(
      'Failed to fetch onchain listings from subgraph'
    )
  }

  if (onchainListings.ideaTokens.length === 0) {
    throw new EntityNotFoundError(null, 'Got 0 onchain listings from subgraph')
  }

  try {
    const clonedListings = onchainListings.ideaTokens.map((ideaToken) => {
      const clonedListing = ListingModel.build({
        value: getTokenNameUrl({
          marketName: ideaToken.market.name,
          tokenName: ideaToken.name,
        }),
        marketId: ideaToken.market.id,
        marketName: ideaToken.market.name,
        isOnchain: true,
        ghostListedBy: null,
        ghostListedByAccount: null,
        ghostListedAt: null,
        onchainValue: ideaToken.name,
        onchainId: ideaToken.id,
        onchainListedAt: new Date(Number.parseInt(ideaToken.listedAt) * 1000),
        onchainListedBy: ideaToken.tokenOwner,
        onchainListedByAccount: null,
        totalVotes: 0,
      })

      return ListingModel.create(clonedListing)
    })

    await Promise.all(clonedListings)
  } catch (error) {
    console.error(
      'Error occurred while adding cloned onchain listings to web2',
      error
    )
    throw new InternalServerError(
      'Failed to add cloned onchain listings to web2'
    )
  }
}
