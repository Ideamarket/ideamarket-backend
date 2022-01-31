/* eslint-disable prefer-template */
import { gql } from 'graphql-request'

import { WEEK_SECONDS } from '..'
import { ZERO_ADDRESS } from '../web3Util'

export function getTokensQuery({
  marketIds,
  skip,
  limit,
  orderBy,
  orderDirection,
  filterTokens,
  isVerifiedFilter,
  earliestPricePointTs,
  search,
}: {
  marketIds: number[]
  skip: number
  limit: number
  orderBy: string
  orderDirection: string
  filterTokens: string[]
  isVerifiedFilter: boolean
  earliestPricePointTs: number
  search: string | null
}): string {
  const hexMarketIds = marketIds.map((id) => `0x${id.toString(16)}`)
  const inMarkets = hexMarketIds.map((id) => `"${id}"`).join(',')

  let filterTokensQuery = ''
  if (filterTokens.length > 0) {
    filterTokensQuery = 'id_in:['
    filterTokens.forEach((value, index) => {
      if (index > 0) {
        filterTokensQuery += ','
      }
      filterTokensQuery += `"${value}"`
    })
    filterTokensQuery += ']'
  }

  const marketsQuery = inMarkets ? `market_in:[${inMarkets}],` : ''
  const verifiedQuery = isVerifiedFilter
    ? `tokenOwner_not: "${ZERO_ADDRESS}",`
    : ''

  const queries =
    marketsQuery.length > 0 ||
    verifiedQuery.length > 0 ||
    filterTokensQuery.length > 0
      ? `where:{${marketsQuery}${verifiedQuery}${filterTokensQuery}},`
      : ''

  const currentTs = Math.floor(Date.now() / 1000)
  const weekBack = currentTs - WEEK_SECONDS

  if (search) {
    return gql`
      {
        tokenNameSearch(${queries} skip:${skip}, first:${limit}, orderBy:${orderBy}, orderDirection:${orderDirection}, text:${
      '"' + search + ':*"'
    }) {
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
            earliestPricePoint: pricePoints(first:1, orderBy:"timestamp", orderDirection:"asc", where:{timestamp_gt:"${earliestPricePointTs}"}) {
              counter
              timestamp
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
    `
  }

  return gql`
    {
      ideaTokens(${queries} skip:${skip}, first:${limit}, orderBy:${orderBy}, orderDirection:${orderDirection}) {
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
          earliestPricePoint: pricePoints(first:1, orderBy:"timestamp", orderDirection:"asc", where:{timestamp_gt:"${earliestPricePointTs}"}) {
            counter
            timestamp
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
  `
}
