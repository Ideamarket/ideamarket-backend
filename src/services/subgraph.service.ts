/* eslint-disable unicorn/no-keyword-prefix */
/* eslint-disable no-await-in-loop */
import config from 'config'
import { gql, request } from 'graphql-request'

import { ListingModel } from '../models/listing.model'
import type { OnchainTokens } from '../types/listing.types'
import type { IdeaToken, IdeaTokens } from '../types/subgraph.types'
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
  const totalOnchainListings = allOnchainListings.length
  let newOnchainListings = 0

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
      newOnchainListings += 1
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
    return { totalOnchainListings, newOnchainListings }
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
