import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import type { TwitterUserTokenResponse } from '../types/twitter-user-token.types'

export function mapTwitterUserTokenResponse(
  twitterUserTokenDoc: TwitterUserTokenDocument | null
): TwitterUserTokenResponse | null {
  if (!twitterUserTokenDoc) {
    return null
  }

  return {
    id: twitterUserTokenDoc._id.toString(),
    twitterUserId: twitterUserTokenDoc.twitterUserId,
    twitterUsername: twitterUserTokenDoc.twitterUsername,
  }
}
