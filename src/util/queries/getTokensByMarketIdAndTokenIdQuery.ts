 
import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'

export function getTokensByMarketIdAndTokenIdQuery({
  marketId,
  tokenId,
}: {
  marketId: number
  tokenId: number
}): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  return gql`
    {
      ideaMarkets(where:{marketID:${marketId}}) {
        tokens(where:{tokenID:${tokenId}}) {
            id
            name
            holders
            marketCap
            market {
              id: marketID
              name
            }
            lister
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
    }
  `
}
