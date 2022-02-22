/* eslint-disable unicorn/no-await-expression-member */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable require-unicode-regexp */
/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable no-await-in-loop */
import got from 'got'

import type { QueueWork } from '../queue'
import { Queue } from '../queue'
import { log, LOG_LEVEL } from '../util'

const feedLimit = 50
const MIN_TIME_BETWEEN_REQUESTS = 200
let lastRequestTs = 0

const workQueue = new Queue(async (q: QueueWork[]) => {
  while (q.length > 0) {
    const w = q.shift() as QueueWork
    const { tokenName: initialTokenName, sha } = w.work
    const regex = /^@/
    const tokenName = (initialTokenName as string).replace(regex, '')

    log(LOG_LEVEL.DEBUG, `Minds: Checking ${tokenName} for ${sha}`)

    const now = Date.now()
    if (now - lastRequestTs < MIN_TIME_BETWEEN_REQUESTS) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, MIN_TIME_BETWEEN_REQUESTS - (now - lastRequestTs))
      })
    }
    lastRequestTs = now

    let userProfile: any
    try {
      userProfile = JSON.parse(
        (await got.get(`https://www.minds.com/api/v1/channel/${tokenName}`))
          .body
      )
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Communication with Minds API(1) failed: ${error}`)
      w.reject('Communication with Minds API(1) failed')
      continue
    }

    let guid: string
    try {
      guid = userProfile.channel.guid
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Failed to parse Minds API response: ${error}`)
      w.reject('Failed to parse Minds API response')
      continue
    }

    let userFeed: any
    try {
      userFeed = JSON.parse(
        (
          await got.get(
            `https://www.minds.com/api/v2/feeds/container/${guid}/activities?sync=1&limit=${feedLimit}`
          )
        ).body
      )
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Communication with Minds API(2) failed: ${error}`)
      w.reject('Communication with Minds API(2) failed')
      continue
    }

    try {
      const feedMessages: string[] = userFeed.entities.map(
        (feedEntity: any) => feedEntity.entity.message
      )
      for (let i = 0; i < feedMessages.length; i++) {
        const message = feedMessages[i]
        console.log(message)
        if (message.includes(sha)) {
          w.resolve()
          return
        }
      }

      log(LOG_LEVEL.ERROR, 'SHA not found in Minds feed')
      w.reject('SHA not found in Minds feed')
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Failed to parse Minds API response: ${error}`)
      w.reject('Failed to parse Minds API response')
      continue
    }
  }
})

export async function mindsVerify(
  tokenName: string,
  sha: string
): Promise<boolean> {
  const promise = workQueue.pushWork({ tokenName, sha })

  try {
    await promise
    return true
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Minds: Exception when pushing work: ${error}`)
    return false
  }
}
