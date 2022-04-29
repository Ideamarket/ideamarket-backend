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
  const ideamarketPostsContract = getIdeamarketPostsContract()
  return ideamarketPostsContract.methods.getPost(tokenID).call()
}

export async function getAllIdeamarketPosts() {
  const allPosts = []
  const tokenIDs = await getTokenIDsOfAllPosts()

  for await (const tokenID of tokenIDs) {
    const post = await getIdeamarketPostByTokenID(tokenID)
    allPosts.push(post)
  }

  return allPosts
}
