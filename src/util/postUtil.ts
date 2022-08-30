/* eslint-disable sonarjs/cognitive-complexity */
import config from 'config'
import type { Citation, NFTOpinionDocument } from 'models/nft-opinion.model'
import type { UserTokenDocument } from 'models/user-token.model'

import type { PostDocument } from '../models/post.model'
import type {
  PostOpinion,
  PostResponse,
  PostOpinionWithPostResponse,
  CitationResponse,
} from '../types/post.types'
import { mapUserTokenResponse } from './userTokenUtil'

const cloudFrontDomain: string = config.get('userToken.cloudFrontDomain')

export function mapPostResponse(post: any): PostResponse | null {
  if (!post) {
    return null
  }

  return {
    id: post._id.toString(),
    contractAddress: post.contractAddress,
    tokenID: post.tokenID,
    minterAddress: post.minterAddress,
    content: post.content,
    postedAt: post.postedAt ?? null,
    categories: post.categories,
    imageLink: post.imageLink,
    isURL: post.isURL,
    urlContent: post.urlContent,
    averageRating: post.averageRating,
    compositeRating: post.compositeRating,
    marketInterest: post.marketInterest,
    totalRatingsCount: post.totalRatingsCount,
    latestRatingsCount: post.latestRatingsCount,
    totalCommentsCount: post.totalCommentsCount,
    latestCommentsCount: post.latestCommentsCount,
    minterToken: mapUserTokenResponse(post.userToken),
    topCitations: post.topCitations,
    topRatings: post.topRatings,
  }
}

export function mapPostOpinionResponse(
  postOpinion:
    | (NFTOpinionDocument & { userToken: UserTokenDocument | null })
    | null,
  citationPostsMap: Record<number, PostDocument | null>,
  citationMintersMap: Record<string, UserTokenDocument | null>
): PostOpinion | null {
  if (!postOpinion) {
    return null
  }

  return {
    contractAddress: postOpinion.contractAddress,
    tokenID: postOpinion.tokenID,
    ratedBy: postOpinion.ratedBy,
    ratedAt: postOpinion.ratedAt,
    rating: postOpinion.rating,
    comment: postOpinion.comment,
    citations: mapCitations(
      postOpinion.citations,
      citationPostsMap,
      citationMintersMap
    ),
    userToken: mapUserTokenResponse(postOpinion.userToken),
  }
}

export function mapPostOpinionWithPost({
  post,
  postOpinion,
  citationPostsMap,
  citationMintersMap,
}: {
  post: (PostDocument & { userToken: UserTokenDocument | null }) | null
  postOpinion: NFTOpinionDocument | null
  citationPostsMap: Record<number, PostDocument | null>
  citationMintersMap: Record<string, UserTokenDocument | null>
}): PostOpinionWithPostResponse | null {
  if (!postOpinion) {
    return null
  }

  return {
    contractAddress: postOpinion.contractAddress,
    tokenID: postOpinion.tokenID,
    minterAddress: post?.minterAddress ?? null,
    content: post?.content ?? null,
    postedAt: post?.postedAt ?? null,
    categories: post?.categories ?? [],
    imageLink: post?.imageLink ?? null,
    isURL: post ? post.isURL : null,
    urlContent: post?.urlContent ?? null,
    ratedBy: postOpinion.ratedBy,
    ratedAt: postOpinion.ratedAt,
    rating: postOpinion.rating,
    comment: postOpinion.comment,
    citations: mapCitations(
      postOpinion.citations,
      citationPostsMap,
      citationMintersMap
    ),
    averageRating: post?.averageRating ?? 0,
    compositeRating: post?.compositeRating ?? 0,
    marketInterest: post?.marketInterest ?? 0,
    totalRatingsCount: post?.totalRatingsCount ?? 0,
    latestRatingsCount: post?.latestRatingsCount ?? 0,
    totalCommentsCount: post?.totalCommentsCount ?? 0,
    latestCommentsCount: post?.latestCommentsCount ?? 0,
    minterToken: mapUserTokenResponse(post?.userToken ?? null),
  }
}

function mapCitations(
  citations: Citation[],
  citationPostsMap: Record<number, PostDocument | null>,
  citationMintersMap: Record<string, UserTokenDocument | null>
): CitationResponse[] {
  return citations.map((citation) => {
    const citationPost = citationPostsMap[citation.tokenID]
    const minter = citationPost
      ? citationMintersMap[citationPost.minterAddress]
      : null

    return {
      citation: citationPost
        ? {
            postId: citationPost._id.toString() as string,
            tokenID: citationPost.tokenID,
            content: citationPost.content,
            compositeRating: citationPost.compositeRating,
            averageRating: citationPost.averageRating,
            totalRatingsCount: citationPost.totalRatingsCount || 0,
            latestRatingsCount: citationPost.compositeRating || 0,
            minterToken: minter
              ? {
                  id: minter._id.toString() as string,
                  walletAddress: minter.walletAddress,
                  username: minter.username || null,
                  profilePhoto: minter.profilePhoto
                    ? `${cloudFrontDomain}/${minter.profilePhoto}`
                    : null,
                }
              : null,
          }
        : null,
      inFavor: citation.inFavor,
    }
  })
}
