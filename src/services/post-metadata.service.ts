import { PostMetadataModel } from '../models/post-metadata.model'
import { mapPostMetadataResponse } from '../util/postMetadataUtil'

export async function fetchPostMetadataFromWeb2({
  tokenID,
}: {
  tokenID: number | null
}) {
  if (!tokenID) {
    return null
  }

  const post = await PostMetadataModel.findOne({ tokenID })

  return mapPostMetadataResponse(post)
}

export async function updatePostMetadataInWeb2({
  tokenID,
  minterAddress,
  content,
  categories,
}: {
  tokenID: number | null
  minterAddress: string | null
  content: string | null
  categories: string[]
}) {
  try {
    console.log(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Updating post metadata for tokenID=${tokenID}`
    )
    // eslint-disable-next-line sonarjs/prefer-immediate-return
    const updatedPost = await PostMetadataModel.findOneAndUpdate(
      {
        tokenID,
      },
      {
        $set: {
          tokenID,
          minterAddress,
          content,
          // postedAt,
          categories,
        },
      },
      { upsert: true, new: true }
    )

    return updatedPost
  } catch (error) {
    console.error('Error occurred while updating the post metadata', error)
    return await Promise.resolve(null)
  }
}
