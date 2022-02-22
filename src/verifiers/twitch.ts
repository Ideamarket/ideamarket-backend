/* eslint-disable sonarjs/cognitive-complexity */
 
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prefer-destructuring */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable require-atomic-updates */
/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-loop-func */
/* eslint-disable unicorn/no-await-expression-member */
import got from 'got'

import { getTwitchConfig } from '../../config/default'
import type { QueueWork } from '../queue'
import { Queue } from '../queue'
import { log, LOG_LEVEL } from '../util'

const MIN_TIME_BETWEEN_REQUESTS = 200
let lastRequestTs = 0

async function getOAuthToken(): Promise<string> {
  const { clientID, clientSecret } = getTwitchConfig()

  const request = await got.post(
    `https://id.twitch.tv/oauth2/token?client_id=${clientID}&client_secret=${clientSecret}&grant_type=client_credentials`
  )

  if (request?.body) {
    const body = JSON.parse(request.body)
    return body.access_token
  }

  return ''
}

async function revokeOAuthToken(token: string) {
  const { clientID } = getTwitchConfig()
  try {
    await got.post(
      `https://id.twitch.tv/oauth2/revoke?client_id=${clientID}&token=${token}`
    )
    return
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Twitch: Failed to revoke OAuth token: ${error}`)
  }
}

const workQueue = new Queue(async (q: QueueWork[]) => {
  while (q.length > 0) {
    const w = q.shift() as QueueWork
    const { tokenName, sha } = w.work

    log(LOG_LEVEL.DEBUG, `Twitch: Checking ${tokenName} for ${sha}`)

    const now = Date.now()
    if (now - lastRequestTs < MIN_TIME_BETWEEN_REQUESTS) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, MIN_TIME_BETWEEN_REQUESTS - (now - lastRequestTs))
      })
    }

    lastRequestTs = now

    // ---------------
    // Request OAuth token
    let oauthToken
    try {
      oauthToken = await getOAuthToken()
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Twitch: Failed to get OAuth token: ${error}`)
      w.reject('Twitch: Failed to get OAuth token')
      continue
    }

    // Request Twitch API
    let resp
    try {
      resp = JSON.parse(
        (
          await got(`https://api.twitch.tv/helix/users?login=${tokenName}`, {
            headers: {
              'Client-Id': getTwitchConfig().clientID,
              Authorization: `Bearer ${oauthToken}`,
            },
          })
        ).body
      )
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Communication with Twitch failed: ${error}`)
      w.reject('Communication with Twitch failed')
      await revokeOAuthToken(oauthToken)
      continue
    }

    try {
      if (!resp.data || resp.data.length !== 1) {
        log(LOG_LEVEL.ERROR, `Twitch: User not found${resp}`)
        w.reject('Twitch: User not found')
        await revokeOAuthToken(oauthToken)
        continue
      }

      const data = resp.data[0]
      if (!data.description) {
        log(LOG_LEVEL.ERROR, `Twitch: Description not found${resp}`)
        w.reject('Twitch: Description not found')
        await revokeOAuthToken(oauthToken)
        continue
      }

      log(LOG_LEVEL.DEBUG, data.description)
      if (data.description.includes(sha)) {
        w.resolve()
      } else {
        log(LOG_LEVEL.ERROR, 'SHA not found in Twitch description.')
        w.reject('SHA not found in Twitch description.')
        await revokeOAuthToken(oauthToken)
      }

      // ---------------
    } catch (error) {
      log(LOG_LEVEL.ERROR, `Failed to parse Twitch response: ${error}`)
      w.reject('Failed to parse Twitch response')
      await revokeOAuthToken(oauthToken)
      continue
    }
  }
})

export async function twitchVerify(
  tokenName: string,
  sha: string
): Promise<boolean> {
  const promise = workQueue.pushWork({ tokenName, sha })

  try {
    await promise
    return true
  } catch (error) {
    log(LOG_LEVEL.ERROR, `Twitch: Exception when pushing work: ${error}`)
    return false
  }
}
