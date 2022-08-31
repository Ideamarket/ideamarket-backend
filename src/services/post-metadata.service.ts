/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { PostMetadataModel } from '../models/post-metadata.model'
import { mapPostMetadataResponse } from '../util/postMetadataUtil'
import { getIdeamarketPostsContract, web3 } from '../web3/contract'
import { getUnsyncedIdeamarketPostIDs } from '../web3/posts'

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
    console.log(`Updating post metadata for tokenID=${tokenID}`)
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

    return await Promise.resolve(updatedPost)
  } catch (error) {
    console.error('Error occurred while updating the post metadata', error)
    return await Promise.resolve(null)
  }
}

export async function syncChainToPostMetadataByTokenID({
  tokenID,
}: {
  tokenID: number | null
}) {
  try {
    console.log(`Syncing post metadata for tokenID=${tokenID} from chain to DB`)

    // Pull from DB. If it exists, log error that doesn't stop execution
    const post = await PostMetadataModel.findOne({ tokenID })

    if (post) {
      console.log(`tokenID=${tokenID} is already stored in DB, no need to sync`)
      return await Promise.resolve(post)
    }

    const ideamarketPostsContract = getIdeamarketPostsContract()
    const postContent = await ideamarketPostsContract.methods
      .getPost(tokenID)
      .call()

    if (!postContent) {
      console.error(
        'Error occurred while syncing the post metadata from chain to DB. No token found on chain'
      )
      return await Promise.resolve(null)
    }

    const postEvents = await ideamarketPostsContract.getPastEvents('Transfer', {
      filter: {
        from: '0x0000000000000000000000000000000000000000',
        tokenId: tokenID?.toString() as any,
      }, // 0 address means this Transfer was a mint and not a NFt transfer
      fromBlock: 14_090_687,
      toBlock: 'latest',
    })

    if (postEvents.length <= 0) {
      console.error(
        'Error occurred while syncing the post metadata from chain to DB. No mint event found'
      )
      return await Promise.resolve(null)
    }

    // eslint-disable-next-line prefer-destructuring
    const postEvent = postEvents[0]

    const minter = postEvent.returnValues.to.toLowerCase()
    const block = await web3.eth.getBlock(postEvent.blockHash)
    const mintTimestamp = block.timestamp.toString()
    const mintDate = new Date(Number.parseInt(mintTimestamp) * 1000)

    const updatedPost = await PostMetadataModel.findOneAndUpdate(
      {
        tokenID,
      },
      {
        $set: {
          tokenID,
          minterAddress: minter,
          content: postContent,
          postedAt: mintDate,
          // categories,
        },
      },
      { upsert: true, new: true }
    )

    return await Promise.resolve(updatedPost)
  } catch (error) {
    console.error(
      'Error occurred while syncing the post metadata from chain to DB',
      error
    )
    return await Promise.resolve(null)
  }
}

export async function syncAllChainToPostMetadata() {
  try {
    console.log(`Syncing post metadata from chain to DB`)

    const unsycedPostIDs = await getUnsyncedIdeamarketPostIDs()

    for await (const postID of unsycedPostIDs) {
      await syncChainToPostMetadataByTokenID({ tokenID: postID })
    }

    return await Promise.resolve(null)
  } catch (error) {
    console.error(
      'Error occurred while syncing all unsynced post metadata from chain to DB',
      error
    )
    return await Promise.resolve(null)
  }
}
