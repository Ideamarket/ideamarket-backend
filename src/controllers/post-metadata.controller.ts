/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchPostMetadataFromWeb2,
  syncAllChainToPostMetadata,
  syncChainToPostMetadataByTokenID,
  updatePostMetadataInWeb2,
} from '../services/post-metadata.service'

export async function fetchPostMetadata(req: Request, res: Response) {
  try {
    const tokenID = req.params.tokenID
      ? Number.parseInt(req.params.tokenID)
      : null

    const post = await fetchPostMetadataFromWeb2({ tokenID })

    // Returns differently than most APIs because NFT marketplace needs very specific format
    return res.status(200).json(post)
  } catch (error) {
    console.error(
      'Error occurred while fetching the ideamarket post metadata',
      error
    )
    return handleError(
      res,
      error,
      'Unable to fetch the ideamarket post metadata'
    )
  }
}

export async function updatePostMetadata(req: Request, res: Response) {
  try {
    const tokenID = req.body.tokenID ? Number.parseInt(req.body.tokenID) : null
    const minterAddress = (req.body.minterAddress as string) || null
    const content = (req.body.content as string) || null
    const categories =
      (req.body.categories as string | undefined)?.split(',') ?? []

    await updatePostMetadataInWeb2({
      tokenID,
      minterAddress,
      content,
      categories,
    })
    return handleSuccess(res, {
      message: `Ideamarket post with tokenID=${tokenID} has been updated`,
    })
  } catch (error) {
    console.error(
      `Error occurred while updating Ideamarket post with tokenID=${req.body.tokenID}`,
      error
    )
    return handleError(res, error, 'Unable to update ideamarket post')
  }
}

export async function syncChainToPostMetadata(req: Request, res: Response) {
  try {
    const tokenID = req.body.tokenID ? Number.parseInt(req.body.tokenID) : null

    if (tokenID) {
      await syncChainToPostMetadataByTokenID({
        tokenID,
      })
      return handleSuccess(res, {
        message: `Ideamarket post with tokenID=${tokenID} has been synced from chain to postmetadatas table`,
      })
    }

    await syncAllChainToPostMetadata()
    return handleSuccess(res, {
      message: `All unsynced Ideamarket posts have been synced from chain to postmetadatas table`,
    })
  } catch (error) {
    console.error(
      `Error occurred while syncing Ideamarket post with tokenID=${req.body.tokenID} from chain to DB`,
      error
    )
    return handleError(
      res,
      error,
      'Unable to sync ideamarket post from chain to DB'
    )
  }
}
