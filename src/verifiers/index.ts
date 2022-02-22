/* eslint-disable @typescript-eslint/no-throw-literal */
import { mindsVerify } from './minds'
import { showtimeVerify } from './showtime'
import { substackVerify } from './substack'
import { twitchVerify } from './twitch'
import { twitterVerify } from './twitter'
import { youtubeVerify } from './youtube'

export async function checkVerification(
  tokenName: string,
  marketName: string,
  sha: string
): Promise<boolean> {
  switch (marketName) {
    case 'Twitter': {
      return twitterVerify(tokenName, sha)
    }
    case 'Substack': {
      return substackVerify(tokenName, sha)
    }
    case 'Youtube': {
      return youtubeVerify(tokenName, sha)
    }
    case 'Showtime': {
      return showtimeVerify(tokenName, sha)
    }
    case 'Twitch': {
      return twitchVerify(tokenName, sha)
    }
    case 'Minds': {
      return mindsVerify(tokenName, sha)
    }
    // No default
  }

  throw 'Market is not supported for automated verification'
}
