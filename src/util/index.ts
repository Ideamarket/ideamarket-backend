/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import normalizeUrl from 'normalize-url'

import type { IdeaMarket } from '../types/subgraph.types'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))
export const tenPow2 = new BigNumber('10').pow(new BigNumber('2'))
export const web3TenPow18 = new BN('10').pow(new BN('18'))

export const sortStringByOrder =
  (orderDirection: string) => (a: string, b: string) => {
    return orderDirection === 'asc' ? a.localeCompare(b) : b.localeCompare(a)
  }

export const sortNumberByOrder =
  (orderDirection: string) => (a: number, b: number) => {
    return orderDirection === 'asc' ? a - b : b - a
  }

export function getDateAfterXDays(x: number) {
  const date = new Date()
  date.setDate(date.getDate() + x)

  return date
}

export function normalize(url: string) {
  return normalizeUrl(url)
}

export function calculateCurrentPriceBN(
  rawSupply: BN,
  rawBaseCost: BN,
  rawPriceRise: BN,
  rawHatchTokens: BN
): BN {
  if (!rawSupply || !rawBaseCost || rawSupply.lt(rawHatchTokens)) {
    return rawBaseCost
  }

  const updatedSupply = rawSupply.sub(rawHatchTokens)
  return rawBaseCost.add(
    rawPriceRise.mul(updatedSupply).div(new BN('10').pow(new BN('18')))
  )
}

export function floatToWeb3BN(
  float: string,
  decimals: number,
  round: BigNumber.RoundingMode
) {
  const pow = new BigNumber('10').exponentiatedBy(decimals)
  const big = new BigNumber(float).multipliedBy(pow)
  return new BN(big.toFixed(0, round))
}

export function web3BNToFloatString(
  bn: BN,
  divideBy: BigNumber,
  decimals: number,
  roundingMode = BigNumber.ROUND_DOWN
): string {
  const converted = new BigNumber(bn.toString())
  const divided = converted.div(divideBy)
  return divided.toFixed(decimals, roundingMode)
}

export function calculateIdeaTokenDaiValue(
  supplyBN: BN,
  market: IdeaMarket,
  amount: BN
): BN {
  if (!supplyBN || !market || !amount) {
    return new BN('0')
  }

  const FEE_SCALE = new BN('10000')

  const baseCost = market.rawBaseCost
  const priceRise = market.rawPriceRise
  const hatchTokens = market.rawHatchTokens

  const tradingFeeRate = market.rawTradingFeeRate
  const platformFeeRate = market.rawPlatformFeeRate

  let hatchPrice = new BN('0')
  let updatedAmount = amount
  let updatedSupply = supplyBN

  if (supplyBN.sub(amount).lt(hatchTokens)) {
    if (supplyBN.lte(hatchTokens)) {
      return baseCost.mul(amount).div(web3TenPow18)
    }

    const tokensInHatch = hatchTokens.sub(supplyBN.sub(amount))
    hatchPrice = baseCost.mul(tokensInHatch).div(web3TenPow18)
    updatedAmount = amount.sub(tokensInHatch)
    updatedSupply = supplyBN.sub(hatchTokens)
  } else {
    updatedSupply = supplyBN.sub(hatchTokens)
  }

  const priceAtSupply = baseCost.add(
    priceRise.mul(updatedSupply).div(web3TenPow18)
  )
  const priceAtSupplyMinusAmount = baseCost.add(
    priceRise.mul(updatedSupply.sub(updatedAmount)).div(web3TenPow18)
  )
  const average = priceAtSupply.add(priceAtSupplyMinusAmount).div(new BN('2'))

  const rawPrice = hatchPrice.add(average.mul(updatedAmount).div(web3TenPow18))

  const tradingFee = rawPrice.mul(tradingFeeRate).div(FEE_SCALE)
  const platformFee = rawPrice.mul(platformFeeRate).div(FEE_SCALE)

  return rawPrice.sub(tradingFee).sub(platformFee)
}
