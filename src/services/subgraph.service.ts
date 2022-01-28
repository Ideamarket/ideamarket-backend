import config from 'config'
import { gql, request } from 'graphql-request'

import type { OnchainTokens } from '../types/listing.types'

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
