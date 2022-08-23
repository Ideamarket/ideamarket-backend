import type { PostMetadataResponse } from 'types/post-metadata.types'

export function mapPostMetadataResponse(
  post: any
): PostMetadataResponse | null {
  if (!post) {
    return null
  }

  return {
    description:
      'Ideamarket Post that tracks public opinion without trusted third parties',
    image: '',
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    name: `Ideamarket Post #${post.tokenID}`,
    attributes: [
      { trait_type: 'Content', value: post.content },
      { trait_type: 'Categories', value: post.categories },
      { trait_type: 'Minter', value: post.minterAddress },
    ],
  }

  // return {
  //   tokenID: post.tokenID,
  //   minterAddress: post.minterAddress,
  //   content: post.content,
  //   categories: post.categories,
  // }
}
