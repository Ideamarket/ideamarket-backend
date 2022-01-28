/* eslint-disable prefer-template */
import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'

export function getSingleTokenQuery({
  marketName,
  tokenName,
}: {
  marketName: string
  tokenName: string
}): string {
  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  return gql`
    {
      ideaMarkets(where:{name:${'"' + marketName + '"'}}) {
        tokens(where:{name:${'"' + tokenName + '"'}}) {
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
