/* eslint-disable promise/prefer-await-to-callbacks */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
import Twitter from 'twitter'

import { getTwitterConfig } from '../../config/default'
import type { QueueWork } from '../queue'
import { Queue } from '../queue'
import { log, LOG_LEVEL } from '../util'

const MIN_TIME_BETWEEN_REQUESTS = 200
let lastRequestTs = 0

function getAPIClient() {
  const twitterConfig = getTwitterConfig()

  return new Twitter({
    consumer_key: twitterConfig.apiKey,
    consumer_secret: twitterConfig.apiSecret,
    bearer_token: twitterConfig.bearer,
  })
}

const workQueue = new Queue(async (q: QueueWork[]) => {
  while (q.length > 0) {
    const w = q.shift() as QueueWork
    const { tokenName, sha } = w.work

    log(LOG_LEVEL.DEBUG, `Twitter: Checking ${tokenName} for ${sha}`)

    const now = Date.now()
    if (now - lastRequestTs < MIN_TIME_BETWEEN_REQUESTS) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, MIN_TIME_BETWEEN_REQUESTS - (now - lastRequestTs))
      })
    }
    lastRequestTs = now

    const client = getAPIClient()

    client.get(
      '/statuses/user_timeline.json',
      { screen_name: tokenName, exclude_replies: true, include_rts: false },
      (err: any, tweets: any) => {
        if (err) {
          log(LOG_LEVEL.ERROR, `Communication with Twitter API failed: ${err}`)
          w.reject('Communication with Twitter API failed')
          return
        }

        for (let i = 0; i < tweets.length; i++) {
          const { text } = tweets[i]
          console.log(text)
          if (text.includes(sha)) {
            w.resolve()
            return
          }
        }

        log(LOG_LEVEL.ERROR, 'No Tweet with required content found')
        w.reject('No tweet with required content found.')
      }
    )
  }
})

export async function twitterVerify(
  tokenName: string,
  sha: string
): Promise<boolean> {
  const promise = workQueue.pushWork({ tokenName, sha })

  try {
    await promise
    return true
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Twitter: Exception when pushing work: ${error}`)
    return false
  }
}
