import type { TwitterOpinionDocument } from '../models/twitter-opinion.model'
import type { TwitterPostDocument } from '../models/twitter-post.model'
import type { TwitterUserTokenDocument } from '../models/twitter-user-token.model'
import type {
  TwitterCitation,
  TwitterCitationResponse,
  TwitterOpinionResponse,
} from '../types/twitter-opinion.types'
import { mapTwitterPostResponse } from './twitterPostUtil'
import { mapTwitterUserTokenResponse } from './twitterUserTokenUtil'

export function mapTwitterOpinionResponse(
  opinion:
    | (TwitterOpinionDocument & {
        userToken: TwitterUserTokenDocument | null
      } & TwitterPostDocument)
    | null,
  citationPostsMap: Record<number, TwitterPostDocument | null>,
  citationMintersMap: Record<string, TwitterUserTokenDocument | null>
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
    citations: mapCitations(
      opinion.citations,
      citationPostsMap,
      citationMintersMap
    ),
    userToken: mapTwitterUserTokenResponse(opinion.userToken),

    // When pulling opinions of a user, we also need the ratedPost's content
    content: opinion.content,
  }
}

export function mapCitations(
  citations: TwitterCitation[],
  citationPostsMap: Record<string, TwitterPostDocument | null>,
  citationMintersMap?: Record<string, TwitterUserTokenDocument | null> | null
): TwitterCitationResponse[] {
  return citations.map((citation) => {
    const citationPost = citationPostsMap[citation.postID] as any
    const user =
      citationPost && citationMintersMap
        ? citationMintersMap[citationPost.twitterUsername]
        : null
    citationPost.userToken = user

    return {
      citation: mapTwitterPostResponse(citationPost),
      inFavor: citation.inFavor,
    }
  })
}
