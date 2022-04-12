/* eslint-disable sonarjs/cognitive-complexity */
import BN from 'bn.js'

import { calculateWeekChange } from '../services/listing.service'
import type {
  IdeaMarket,
  IdeaMarketToken,
  IdeaMarketTokenPricePoint,
  IdeaTokenTrade,
  WalletHolding,
} from '../types/subgraph.types'
import {
  bigNumberTenPow18,
  calculateCurrentPriceBN,
  calculateIdeaTokenDaiValue,
  sortNumberByOrder,
  sortStringByOrder,
  tenPow2,
  web3BNToFloatString,
} from '../util'

function apiResponseToPricePoint(apiResponse: any): IdeaMarketTokenPricePoint {
  return {
    timestamp: Number.parseInt(apiResponse.timestamp),
    counter: Number.parseInt(apiResponse.counter),
    oldPrice: Number.parseFloat(apiResponse.oldPrice),
    price: Number.parseFloat(apiResponse.price),
  }
}

export function apiResponseToIdeaToken(
  apiResponse: any,
  marketApiResponse?: any,
  holder?: string,
  isL1?: boolean
): Partial<IdeaMarketToken> {
  let market
  if (apiResponse.market) {
    market = { apiResponse }
  } else if (marketApiResponse) {
    market = marketApiResponse
  } else {
    market = null
  }

  return {
    address: apiResponse.id,
    marketID: market?.id,
    marketName: market?.name,
    tokenID: apiResponse.tokenID,
    name: apiResponse.name,
    supply: apiResponse.supply
      ? web3BNToFloatString(new BN(apiResponse.supply), bigNumberTenPow18, 2)
      : '0',
    rawSupply: apiResponse.supply ? new BN(apiResponse.supply) : new BN(0),
    holders: apiResponse.holders,
    marketCap: apiResponse.marketCap
      ? web3BNToFloatString(new BN(apiResponse.marketCap), bigNumberTenPow18, 2)
      : '0',
    rawMarketCap: apiResponse.marketCap
      ? new BN(apiResponse.marketCap)
      : new BN(0),
    rank: apiResponse.rank,
    tokenOwner: apiResponse.tokenOwner ? apiResponse.tokenOwner : '',
    daiInToken: apiResponse.daiInToken
      ? web3BNToFloatString(
          new BN(apiResponse.daiInToken),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawDaiInToken: apiResponse.daiInToken
      ? new BN(apiResponse.daiInToken)
      : new BN(0),
    invested: apiResponse.invested
      ? web3BNToFloatString(new BN(apiResponse.invested), bigNumberTenPow18, 2)
      : '0',
    rawInvested: apiResponse.invested
      ? new BN(apiResponse.invested)
      : new BN(0),
    tokenInterestRedeemed: apiResponse.tokenInterestRedeemed
      ? web3BNToFloatString(
          new BN(apiResponse.tokenInterestRedeemed),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawTokenInterestRedeemed: apiResponse.tokenInterestRedeemed
      ? new BN(apiResponse.tokenInterestRedeemed)
      : new BN(0),
    latestPricePoint:
      apiResponse.latestPricePoint &&
      apiResponseToPricePoint(apiResponse.latestPricePoint),
    earliestPricePoint:
      apiResponse.earliestPricePoint &&
      apiResponse.earliestPricePoint.length > 0 &&
      apiResponseToPricePoint(apiResponse.earliestPricePoint[0]),
    dayChange: apiResponse.dayChange
      ? (Number.parseFloat(apiResponse.dayChange) * 100).toFixed(2)
      : '0',
    weeklyChange:
      (apiResponse?.pricePoints &&
        calculateWeekChange(apiResponse?.pricePoints)) ||
      '0',
    dayVolume: apiResponse.dayVolume
      ? Number.parseFloat(apiResponse.dayVolume).toFixed(2)
      : '0',
    listedAt: apiResponse.listedAt,
    lockedAmount: apiResponse.lockedAmount
      ? web3BNToFloatString(
          new BN(apiResponse.lockedAmount),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawLockedAmount: apiResponse.lockedAmount
      ? new BN(apiResponse.lockedAmount)
      : new BN(0),
    lockedPercentage: apiResponse.lockedPercentage
      ? Number.parseFloat(apiResponse.lockedPercentage).toFixed(2)
      : '',
    isL1,
    holder,
  }
}

export function apiResponseToIdeaMarket(apiResponse: any): IdeaMarket {
  return {
    name: apiResponse.name,
    marketID: apiResponse.marketID,
    baseCost: apiResponse.baseCost
      ? web3BNToFloatString(new BN(apiResponse.baseCost), bigNumberTenPow18, 2)
      : '0',
    rawBaseCost: apiResponse.baseCost
      ? new BN(apiResponse.baseCost)
      : new BN(0),
    priceRise: apiResponse.priceRise
      ? web3BNToFloatString(new BN(apiResponse.priceRise), bigNumberTenPow18, 4)
      : '0',
    rawPriceRise: apiResponse.priceRise
      ? new BN(apiResponse.priceRise)
      : new BN(0),
    hatchTokens: apiResponse.hatchTokens
      ? web3BNToFloatString(
          new BN(apiResponse.hatchTokens),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawHatchTokens: apiResponse.hatchTokens
      ? new BN(apiResponse.hatchTokens)
      : new BN(0),
    tradingFeeRate: apiResponse.tradingFeeRate
      ? web3BNToFloatString(new BN(apiResponse.tradingFeeRate), tenPow2, 2)
      : '0',
    rawTradingFeeRate: apiResponse.tradingFeeRate
      ? new BN(apiResponse.tradingFeeRate)
      : new BN(0),
    platformFeeInvested: apiResponse.platformFeeInvested
      ? web3BNToFloatString(
          new BN(apiResponse.platformFeeInvested),
          bigNumberTenPow18,
          2
        )
      : '0',
    rawPlatformFeeInvested: apiResponse.platformFeeInvested
      ? new BN(apiResponse.platformFeeInvested)
      : new BN(0),
    platformFeeRate: apiResponse.platformFeeRate
      ? web3BNToFloatString(new BN(apiResponse.platformFeeRate), tenPow2, 2)
      : '0',
    rawPlatformFeeRate: apiResponse.platformFeeRate
      ? new BN(apiResponse.platformFeeRate)
      : new BN(0),
    platformOwner: apiResponse.platformOwner,
    platformInterestRedeemed: apiResponse.platformInterestRedeemed
      ? web3BNToFloatString(
          new BN(apiResponse.platformInterestRedeemed),
          tenPow2,
          2
        )
      : '0',
    rawPlatformInterestRedeemed: apiResponse.platformInterestRedeemed
      ? new BN(apiResponse.platformInterestRedeemed)
      : new BN(0),
    platformFeeRedeemed: apiResponse.platformFeeRedeemed
      ? web3BNToFloatString(new BN(apiResponse.platformFeeRedeemed), tenPow2, 2)
      : '0',
    rawPlatformFeeRedeemed: apiResponse.platformFeeRedeemed
      ? new BN(apiResponse.platformFeeRedeemed)
      : new BN(0),
    nameVerifierAddress: apiResponse.nameVerifier,
  }
}

export function sortWalletHoldings({
  holdings,
  orderBy,
  orderDirection,
}: {
  holdings: WalletHolding[]
  orderBy: string
  orderDirection: string
}) {
  const strCmpFunc = sortStringByOrder(orderDirection)
  const numCmpFunc = sortNumberByOrder(orderDirection)

  switch (orderBy) {
    case 'name': {
      holdings.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name ?? '', rhs.token.name ?? '')
      })
      break
    }
    case 'market': {
      holdings.sort((lhs, rhs) => {
        return strCmpFunc(lhs.market.name ?? '', rhs.market.name ?? '')
      })
      break
    }
    case 'price': {
      holdings.sort((lhs, rhs) => {
        return numCmpFunc(
          Number.parseFloat(lhs.token.supply ?? '0'),
          Number.parseFloat(rhs.token.supply ?? '0')
        )
      })
      break
    }
    case 'change': {
      holdings.sort((lhs, rhs) => {
        return numCmpFunc(
          Number.parseFloat(lhs.token.dayChange ?? '0'),
          Number.parseFloat(rhs.token.dayChange ?? '0')
        )
      })
      break
    }
    case 'balance': {
      holdings.sort((lhs, rhs) => {
        return numCmpFunc(
          Number.parseFloat(lhs.balance ?? '0'),
          Number.parseFloat(rhs.balance ?? '0')
        )
      })

      break
    }
    case 'value': {
      holdings.sort((lhs, rhs) => {
        const lhsValue =
          Number.parseFloat(
            web3BNToFloatString(
              calculateCurrentPriceBN(
                lhs.token.rawSupply ?? new BN(0),
                lhs.market.rawBaseCost ?? new BN(0),
                lhs.market.rawPriceRise ?? new BN(0),
                lhs.market.rawHatchTokens ?? new BN(0)
              ),
              bigNumberTenPow18,
              2
            )
          ) * Number.parseFloat(lhs.balance ?? '0')

        const rhsValue =
          Number.parseFloat(
            web3BNToFloatString(
              calculateCurrentPriceBN(
                rhs.token.rawSupply ?? new BN(0),
                rhs.market.rawBaseCost ?? new BN(0),
                rhs.market.rawPriceRise ?? new BN(0),
                rhs.market.rawHatchTokens ?? new BN(0)
              ),
              bigNumberTenPow18,
              2
            )
          ) * Number.parseFloat(rhs.balance ?? '0')

        return numCmpFunc(lhsValue, rhsValue)
      })
      break
    }
  }
}

export function sortTrades({
  trades,
  orderBy,
  orderDirection,
}: {
  trades: IdeaTokenTrade[]
  orderBy: string
  orderDirection: string
}) {
  const strCmpFunc = sortStringByOrder(orderDirection)
  const numCmpFunc = sortNumberByOrder(orderDirection)

  switch (orderBy) {
    case 'name': {
      trades.sort((lhs, rhs) => {
        return strCmpFunc(lhs.token.name, rhs.token.name)
      })

      break
    }
    case 'type': {
      trades.sort((lhs: any, rhs: any) => {
        return numCmpFunc(lhs.isBuy, rhs.isBuy)
      })

      break
    }
    case 'amount': {
      trades.sort((lhs, rhs) => {
        return numCmpFunc(lhs.ideaTokenAmount, rhs.ideaTokenAmount)
      })

      break
    }
    case 'purchaseValue': {
      trades.sort((lhs, rhs) => {
        return numCmpFunc(lhs.daiAmount, rhs.daiAmount)
      })

      break
    }
    case 'currentValue': {
      trades.sort((lhs, rhs) => {
        const tokenSupplyLeft = lhs.isBuy
          ? lhs.token.rawSupply
          : lhs.token.rawSupply.add(lhs.rawIdeaTokenAmount)
        const ideaTokenValueLeft = Number.parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyLeft,
              lhs.market,
              lhs.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const tokenSupplyRight = rhs.isBuy
          ? rhs.token.rawSupply
          : rhs.token.rawSupply.add(rhs.rawIdeaTokenAmount)
        const ideaTokenValueRight = Number.parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyRight,
              rhs.market,
              rhs.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        return numCmpFunc(ideaTokenValueLeft, ideaTokenValueRight)
      })

      break
    }
    case 'pnl': {
      trades.sort((lhs, rhs) => {
        const tokenSupplyLeft = lhs.isBuy
          ? lhs.token.rawSupply
          : lhs.token.rawSupply.add(lhs.rawIdeaTokenAmount)
        const ideaTokenValueLeft = Number.parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyLeft,
              lhs.market,
              lhs.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const pnlNumberLeft = ideaTokenValueLeft - lhs.daiAmount
        const pnlPercentageLeft = (pnlNumberLeft / lhs.daiAmount) * 100

        const tokenSupplyRight = rhs.isBuy
          ? rhs.token.rawSupply
          : rhs.token.rawSupply.add(rhs.rawIdeaTokenAmount)
        const ideaTokenValueRight = Number.parseFloat(
          web3BNToFloatString(
            calculateIdeaTokenDaiValue(
              tokenSupplyRight,
              rhs.market,
              rhs.rawIdeaTokenAmount
            ),
            bigNumberTenPow18,
            2
          )
        )
        const pnlNumberRight = ideaTokenValueRight - rhs.daiAmount
        const pnlPercentageRight = (pnlNumberRight / rhs.daiAmount) * 100

        return numCmpFunc(pnlPercentageLeft, pnlPercentageRight)
      })

      break
    }
    case 'date': {
      trades.sort((lhs, rhs) => {
        return numCmpFunc(lhs.timestamp, rhs.timestamp)
      })

      break
    }
    // No default
  }
}
