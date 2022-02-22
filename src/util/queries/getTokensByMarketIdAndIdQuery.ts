import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'

export function getTokensByMarketIdAndIdQuery({
  marketId,
  id,
}: {
  marketId: number
  id: string
}): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  return gql`
    {
      ideaMarkets(where:{marketID:${marketId}}) {
        tokens(where:{id:"${id}"}) {
            id
            tokenID
            name
            supply
            holders
            marketCap
            market {
              id: marketID
              name
            }
            rank
            lister
            tokenOwner
            daiInToken
            invested
            listedAt
            lockedAmount
            lockedPercentage
            latestPricePoint {
              timestamp
              counter
              oldPrice
              price
            }
            dayVolume
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
