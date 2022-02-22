/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable no-await-in-loop */
import config from 'config'
import { gql, request } from 'graphql-request'

import { getSubgraph } from '../../config/default'
import { ListingModel } from '../models/listing.model'
import type {
  IdeaToken,
  IdeaTokens,
  SubgraphTokenInfoQueryResult,
} from '../types/subgraph.types'
import { getTokenNameUrl } from '../util/marketUtil'
import { getAllTokensQuery } from '../util/queries/getAllTokensQuery'
import { EntityNotFoundError, InternalServerError } from './errors'

const NETWORK: string = config.get('web3.network')
const SUBGRAPH_URL: string = config.get(`web3.subgraphUrls.${NETWORK}`)

export async function executeSubgraphQuery<T>(query: string): Promise<T> {
  return request(
    SUBGRAPH_URL,
    gql`
      ${query}
    `
  )
}

export async function executeSubgraphTokenInfoQuery(
  tokenAddress: string,
  chain: string
): Promise<SubgraphTokenInfoQueryResult> {
  const gqlRequest = gql`
    {
      ideaToken(id:${`"${tokenAddress}"`}) {
        name
        tokenOwner
          market {
            name
        }
      }
    }
  `

  const endpoint = getSubgraph(chain)

  let result
  try {
    result = await request(endpoint, gqlRequest)
  } catch {
    throw 'Failed to query subgraph.'
  }

  if (!result.ideaToken) {
    throw 'Token not found in Subgraph.'
  }

  if (!result.ideaToken.name) {
    throw 'No token name in Subgraph response.'
  }

  if (!result.ideaToken.tokenOwner) {
    throw 'No token owner in Subgraph response.'
  }

  if (!result.ideaToken.market) {
    throw 'No market in Subgraph response.'
  }

  if (!result.ideaToken.market.name) {
    throw 'No market name in Subgraph response.'
  }

  return {
    tokenName: result.ideaToken.name,
    tokenOwner: result.ideaToken.tokenOwner,
    marketName: result.ideaToken.market.name,
  }
}

export async function cloneOnchainTokensToWeb2() {
  const allOnchainListings: IdeaToken[] = []

  try {
    let index = 0
    let fetchedAll = false
    while (!fetchedAll) {
      const onchainListings: IdeaTokens = await request(
        SUBGRAPH_URL,
        getAllTokensQuery({ skip: index * 100, limit: 100 })
      )
      allOnchainListings.push(...onchainListings.ideaTokens)
      if (onchainListings.ideaTokens.length === 0) {
        fetchedAll = true
      }
      index += 1
    }
  } catch (error) {
    console.error(
      'Error occurred while fetching onchain listings from subgraph',
      error
    )
    throw new InternalServerError(
      'Failed to fetch onchain listings from subgraph'
    )
  }

  console.log(`Total Onchain listings found = ${allOnchainListings.length}`)
  if (allOnchainListings.length === 0) {
    throw new EntityNotFoundError(null, 'Got 0 onchain listings from subgraph')
  }

  try {
    const clonedListings = allOnchainListings.map(async (ideaToken) => {
      const listingExists = await ListingModel.exists({
        marketId: ideaToken.market.id,
        onchainValue: ideaToken.name,
      })
      if (listingExists) {
        console.log(
          `MarketId=${ideaToken.market.id} and OnchainValue=${ideaToken.name} already exists in DB`
        )
        return Promise.resolve()
      }
      console.log(
        `MarketId=${ideaToken.market.id} and OnchainValue=${ideaToken.name} does not exist in DB`
      )
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
        onchainListedBy: ideaToken.lister,
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
