/* eslint-disable prefer-destructuring */
/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable require-atomic-updates */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
import cheerio from 'cheerio'
import got from 'got'

import type { QueueWork } from '../queue'
import { Queue } from '../queue'
import { log, LOG_LEVEL } from '../util'

const MIN_TIME_BETWEEN_REQUESTS = 200
let lastRequestTs = 0

const workQueue = new Queue(async (q: QueueWork[]) => {
  while (q.length > 0) {
    const w = q.shift() as QueueWork
    const { tokenName, sha } = w.work

    log(LOG_LEVEL.DEBUG, `Showtime: Checking ${tokenName} for ${sha}`)

    const now = Date.now()
    if (now - lastRequestTs < MIN_TIME_BETWEEN_REQUESTS) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, MIN_TIME_BETWEEN_REQUESTS - (now - lastRequestTs))
      })
    }
    lastRequestTs = now

    let body
    try {
      body = (await got(`https://tryshowtime.com/${tokenName}`)).body
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Communication with Showtime failed: ${error}`)
      w.reject('Communication with Showtime failed')
      continue
    }

    try {
      const $ = cheerio.load(body)
      const rawJson = $('script[id="__NEXT_DATA__"]').html()
      const json = JSON.parse(rawJson as string)
      const content = json.props.pageProps.bio
      console.log(content)
      if (content.includes(sha)) {
        w.resolve()
      } else {
        log(LOG_LEVEL.ERROR, 'SHA not found in Showtime bio.')
        w.reject('SHA not found in Showtime bio.')
      }
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Failed to parse Showtime response: ${error}`)
      w.reject('Failed to parse Showtime response')
      continue
    }
  }
})

export async function showtimeVerify(
  tokenName: string,
  sha: string
): Promise<boolean> {
  const promise = workQueue.pushWork({ tokenName, sha })

  try {
    await promise
    return true
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Showtime: Exception when pushing work: ${error}`)
    return false
  }
}
