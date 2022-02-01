import normalizeUrl from 'normalize-url'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export function getDateAfterXDays(x: number) {
  const date = new Date()
  date.setDate(date.getDate() + x)

  return date
}

export function normalize(url: string) {
  return normalizeUrl(url)
}
