import BigNumber from 'bignumber.js'
import type BN from 'bn.js'
import normalizeUrl from 'normalize-url'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export function getDateAfterXDays(x: number) {
  const date = new Date()
  date.setDate(date.getDate() + x)

  return date
}

export function normalize(url: string) {
  return normalizeUrl(url)
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
