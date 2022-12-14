import type { TwitterOpinionDocument } from '../models/twitter-opinion.model'
import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import type { TwitterOpinionResponse } from '../types/twitter-opinion.types'

export function mapTwitterOpinionResponse(
  opinion:
    | (TwitterOpinionDocument & { userToken: TwitterUserTokenDocument | null })
    | null
  // citationPostsMap: Record<number, PostDocument | null>,
  // citationMintersMap: Record<string, UserTokenDocument | null>
): TwitterOpinionResponse | null {
  if (!opinion) {
    return null
  }

  return {
    opinionID: opinion._id,
    ratedPostID: opinion.ratedPostID,
    ratedBy: opinion.ratedBy,
    ratedAt: opinion.ratedAt,
    rating: opinion.rating,
    citations: [],
    // citations: mapCitations(
    //   opinion.citations,
    //   citationPostsMap,
    //   citationMintersMap
    // ),
    // userToken: mapUserTokenResponse(opinion.userToken),
  }
}
