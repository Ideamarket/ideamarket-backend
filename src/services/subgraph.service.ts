import config from 'config'
import { gql, request } from 'graphql-request'

const NETWORK: string = config.get('web3.network')
const SUBGRAPH_URL: string = config.get(`web3.subgraphUrls.${NETWORK}`)

export async function executeSubgraphQuery(query: string) {
  return request(
    SUBGRAPH_URL,
    gql`
      ${query}
    `
  )
}
