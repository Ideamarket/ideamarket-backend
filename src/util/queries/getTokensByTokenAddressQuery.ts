import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'

export function getTokensByTokenAddressQuery(tokenAddress: string): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  return gql`
    {
      ideaTokens(where:{id:${`"${tokenAddress}"`}}) {
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
