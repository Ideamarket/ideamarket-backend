import { gql } from 'graphql-request'

import { getAllMarketIds } from '../marketUtil'

export function getAllTokensQuery({
  skip,
  limit,
}: {
  skip: number
  limit: number
}): string {
  const marketIds = getAllMarketIds()
  const hexMarketIds = marketIds.map((id) => `0x${id.toString(16)}`)
  const inMarkets = hexMarketIds.map((id) => `"${id}"`).join(',')
  const marketsQuery = inMarkets ? `market_in:[${inMarkets}],` : ''
  const queries = marketsQuery.length > 0 ? `where:{${marketsQuery}},` : ''

  return gql`
    {
      ideaTokens(${queries} skip:${skip}, first:${limit}) {
          id
          name
          market {
            id: marketID
            name
          }
          lister
          listedAt
        }
    }
  `
}
