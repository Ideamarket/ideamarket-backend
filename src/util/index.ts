/* eslint-disable import/no-extraneous-dependencies */

import BigNumber from 'bignumber.js'
import type BN from 'bn.js'
import chalk from 'chalk'
import normalizeUrl from 'normalize-url'
import { SHA3 } from 'sha3'

export const HOUR_SECONDS = 3600
export const DAY_SECONDS = 86_400
export const WEEK_SECONDS = 604_800
export const MONTH_SECONDS = 2_628_000
export const YEAR_SECONDS = 31_536_000

export const LOG_LEVEL = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  ERROR: 'ERROR',
}

function coloredLogLevel(level: string) {
  switch (level) {
    case LOG_LEVEL.DEBUG:
      return chalk.gray(`[${level}]`)
    case LOG_LEVEL.INFO:
      return chalk.green(`[${level}]`)
    case LOG_LEVEL.ERROR:
      return chalk.red(`[${level}]`)
    default:
      return `[${level}]`
  }
}
export const bigNumberTenPow18 = new BigNumber('10').pow(new BigNumber('18'))

export function getDateAfterXDays(x: number) {
  const date = new Date()
  date.setDate(date.getDate() + x)

  return date
}

export function normalize(url: string) {
  return normalizeUrl(url)
}

export function uuidToSHA3(uuid: string): string {
  return new SHA3(256).update(uuid).digest('hex').toString().slice(0, 12)
}

export function log(level: string, msg: string) {
  const now = new Date().toISOString()

  const output = `${coloredLogLevel(level)} [${now}] ${msg}`
  if (level === LOG_LEVEL.ERROR) {
    console.error(output)
  } else {
    console.log(output)
  }
}

export async function sleep(ms: number) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
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
