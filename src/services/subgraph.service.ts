/* eslint-disable unicorn/no-keyword-prefix */
/* eslint-disable no-await-in-loop */
import config from 'config'
import { gql, request } from 'graphql-request'

import type { OnchainTokens } from '../types/listing.types'
import type { IdeaToken, IdeaTokens } from '../types/subgraph.types'
import { getAllTokensQuery } from '../util/queries/getAllTokensQuery'
import { EntityNotFoundError, InternalServerError } from './errors'
import { updateOnchainListing } from './listing.service'

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

export async function fetchAllOnchainTokensFromWeb3() {
  try {
    const allOnchainTokens: IdeaToken[] = []

    let index = 0
    let fetchedAll = false
    while (!fetchedAll) {
      const onchainListings: IdeaTokens = await request(
        SUBGRAPH_URL,
        getAllTokensQuery({ skip: index * 100, limit: 100 })
      )
      allOnchainTokens.push(...onchainListings.ideaTokens)
      if (onchainListings.ideaTokens.length === 0) {
        fetchedAll = true
      }
      index += 1
    }

    console.log(`Total Onchain tokens found = ${allOnchainTokens.length}`)
    return allOnchainTokens
  } catch (error) {
    console.error(
      'Error occurred while fetching onchain tokens from subgraph',
      error
    )
    throw new InternalServerError(
      'Failed to fetch onchain tokens from subgraph'
    )
  }
}

export async function copyNewOnchainTokensToWeb2() {
  const allOnchainIdeaTokens: IdeaToken[] =
    await fetchAllOnchainTokensFromWeb3()

  let newOnchainListings = 0
  const totalOnchainListings = allOnchainIdeaTokens.length
  if (totalOnchainListings === 0) {
    throw new EntityNotFoundError(null, 'Got 0 onchain listings from subgraph')
  }

  try {
    for (const ideaToken of allOnchainIdeaTokens) {
      const onchainListing = await updateOnchainListing({
        ideaToken,
        updateIfExists: false,
      })

      if (onchainListing) {
        newOnchainListings += 1
      }
    }

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
