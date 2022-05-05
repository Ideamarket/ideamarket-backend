import type { NFTOpinionDocument } from 'models/nft-opinion.model'
import type { UserTokenDocument } from 'models/user-token.model'

import type { PostDocument } from '../models/post.model'
import type {
  PostOpinion,
  PostResponse,
  PostOpinionWithPostResponse,
} from '../types/post.types'
import { mapUserTokenResponse } from './userTokenUtil'

export function mapPostResponse(
  post: (PostDocument & { userToken: UserTokenDocument | null }) | null
): PostResponse | null {
  if (!post) {
    return null
  }

  return {
    contractAddress: post.contractAddress,
    tokenID: post.tokenID,
    minterAddress: post.minterAddress,
    content: post.content,
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
  }
}

export function mapPostOpinionResponse(
  postOpinion:
    | (NFTOpinionDocument & { userToken: UserTokenDocument | null })
    | null
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
    userToken: mapUserTokenResponse(postOpinion.userToken),
  }
}

export function mapPostOpinionWithPost({
  post,
  postOpinion,
}: {
  post: (PostDocument & { userToken: UserTokenDocument | null }) | null
  postOpinion: NFTOpinionDocument | null
}): PostOpinionWithPostResponse | null {
  if (!postOpinion) {
    return null
  }

  return {
    contractAddress: postOpinion.contractAddress,
    tokenID: postOpinion.tokenID,
    minterAddress: post?.minterAddress ?? null,
    content: post?.content ?? null,
    categories: post?.categories ?? [],
    imageLink: post?.imageLink ?? null,
    isURL: post ? post.isURL : null,
    urlContent: post?.urlContent ?? null,
    ratedBy: postOpinion.ratedBy,
    ratedAt: postOpinion.ratedAt,
    rating: postOpinion.rating,
    comment: postOpinion.comment,
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
