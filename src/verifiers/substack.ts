/* eslint-disable prefer-destructuring */
/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable require-atomic-updates */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
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

    log(LOG_LEVEL.DEBUG, `Substack: Checking ${tokenName} for ${sha}`)

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
      body = (await got(`https://${tokenName}.substack.com/about`)).body
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Communication with Substack failed: ${error}`)
      w.reject('Communication with Substack failed')
      continue
    }

    try {
      const $ = cheerio.load(body)
      const content = $('div.content-about').text()
      console.log(content)
      if (content.includes(sha)) {
        w.resolve()
      } else {
        log(LOG_LEVEL.ERROR, 'SHA not found in Substack bio.')
        w.reject('SHA not found in Substack bio.')
      }
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Failed to parse Substack response: ${error}`)
      w.reject('Failed to parse Substack response')
      continue
    }
  }
})

export async function substackVerify(
  tokenName: string,
  sha: string
): Promise<boolean> {
  const promise = workQueue.pushWork({ tokenName, sha })

  try {
    await promise
    return true
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Substack: Exception when pushing work: ${error}`)
    return false
  }
}
