import { PostMetadataModel } from '../models/post-metadata.model'
import { getIdeamarketPostsContract } from './contract'

/**
 * Returns the count of total number of ideamarket posts
 */
async function getTotalIdeamarketPostsCount() {
  const ideamarketPostsContract = getIdeamarketPostsContract()
  return ideamarketPostsContract.methods.totalSupply().call()
}

async function getTokenIDsOfAllPosts() {
  const totalPostsCount = await getTotalIdeamarketPostsCount()

  // TokenIDs : 1,2,3,4,.......,totalPostsCount
  return Array.from({ length: totalPostsCount }, (_, i) => i + 1)
}

export async function getIdeamarketPostByTokenID(tokenID: number) {
  // const ideamarketPostsContract = getIdeamarketPostsContract()
  // return ideamarketPostsContract.methods.getPost(tokenID).call()
  const dbPost = (await PostMetadataModel.findOne({ tokenID })) as any
  return dbPost
    ? {
        tokenID,
        minter: dbPost?.minterAddress,
        content: dbPost?.content,
        timestamp: dbPost?.createdAt,
        categories: dbPost?.categories,
      }
    : null
}

export async function getAllIdeamarketPosts() {
  const allPosts = []
  const tokenIDs = await getTokenIDsOfAllPosts()

  for await (const tokenID of tokenIDs) {
    const customPost = await getIdeamarketPostByTokenID(tokenID)
    if (customPost) {
      allPosts.push(customPost)
    }
  }

  return allPosts
}
