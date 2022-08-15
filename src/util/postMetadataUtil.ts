import type { PostMetadataResponse } from 'types/post-metadata.types'

export function mapPostMetadataResponse(
  post: any
): PostMetadataResponse | null {
  if (!post) {
    return null
  }

  return {
    tokenID: post.tokenID,
    minterAddress: post.minterAddress,
    content: post.content,
    // postedAt: post.postedAt ?? null,
    categories: post.categories,
  }
}
