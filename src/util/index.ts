import config from 'config'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export function isMarketIdValid(marketId: number | string) {
  const marketID = Number.parseInt(marketId as string)
  const validMarkets: string = config.get('markets.validMarketIds')
  const validMarketIds = validMarkets
    .split(',')
    .map((marketId) => Number.parseInt(marketId))

  return validMarketIds.includes(marketID)
}
