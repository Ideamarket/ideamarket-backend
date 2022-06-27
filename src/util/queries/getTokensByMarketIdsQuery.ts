import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'

export function getTokensByMarketIdsQuery({
  marketIds,
  skip,
  limit,
}: {
  marketIds: number[]
  skip: number
  limit: number
}): string {
  const hexMarketIds = marketIds.map((id) => `0x${id.toString(16)}`)
  const inMarkets = hexMarketIds.map((id) => `"${id}"`).join(',')
  const marketsQuery = inMarkets ? `market_in:[${inMarkets}],` : ''
  const queries = marketsQuery.length > 0 ? `where:{${marketsQuery}},` : ''

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  return gql`
    {
      ideaTokens(${queries} skip:${skip}, first:${limit}) {
          id
          name
          holders
          marketCap
          market {
            id: marketID
            name
          }
          balances {
            amount
            holder
          }
          lister
          tokenOwner
          listedAt
          latestPricePoint {
            timestamp
            counter
            oldPrice
            price
          }
          dayChange
          pricePoints(where:{timestamp_gt:${weekBack}} orderBy:timestamp) {
              oldPrice
              price
            }
        }
    }
  `
}
