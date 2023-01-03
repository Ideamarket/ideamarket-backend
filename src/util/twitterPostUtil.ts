import type {
  TwitterCitationPostIds,
  TwitterPostResponse,
} from '../types/twitter-post.types'
import { mapTwitterUserTokenResponse } from './twitterUserTokenUtil'

export function mapTwitterPostResponse(
  post: any,
  citationPostIds?: TwitterCitationPostIds
): TwitterPostResponse | null {
  if (!post) {
    return null
  }

  const convertedIDs = citationPostIds?.forCitationsPostIds.map((id) =>
    id.toString()
  )
  const inFavor = convertedIDs?.includes(post._id.toString()) ?? true

  return {
    postID: post._id.toString(),
    content: post.content,
    postedAt: post.postedAt ?? null,
    // categories: post.categories,
    averageRating: post.averageRating,
    // compositeRating: post.compositeRating,
    // marketInterest: post.marketInterest,
    totalRatingsCount: post.totalRatingsCount,
    latestRatingsCount: post.latestRatingsCount,
    userToken: mapTwitterUserTokenResponse(post.userToken),
    topCitations: post.topCitations,
    topRatings: post.topRatings,
    isPostInFavorOfParent: inFavor,
  }
}
