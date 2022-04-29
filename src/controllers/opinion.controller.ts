import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import {
  fetchAddressOpinionsByAddressFromWeb2,
  fetchAddressOpinionsByWalletFromWeb2,
  syncAllAddressOpinionsInWeb2,
} from '../services/address-opinion.service'
import {
  syncOpinionsOfAllNFTsInWeb2,
  syncOpinionsOfNFTInWeb2,
} from '../services/nft-opinion.service'
import type {
  AddressOpinionQueryOptions,
  AddressOpinionWithSummaryResponse,
} from '../types/address-opinion.types'

export async function fetchAddressOpinionsByAddress(
  req: Request,
  res: Response
) {
  try {
    const tokenAddress = req.query.tokenAddress as string
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof AddressOpinionWithSummaryResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: AddressOpinionQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens: [],
    }

    const addressOpinions = await fetchAddressOpinionsByAddressFromWeb2({
      tokenAddress,
      options,
    })

    return handleSuccess(res, addressOpinions)
  } catch (error) {
    console.error('Error occurred while fetching the address opinions', error)
    return handleError(res, error, 'Unable to fetch the address opinions')
  }
}

export async function fetchAddressOpinionsByWallet(
  req: Request,
  res: Response
) {
  try {
    const walletAddress = req.query.walletAddress as string
    const latest = req.query.latest
      ? (req.query.latest as string) === 'true'
      : true
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof AddressOpinionWithSummaryResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const filterTokens =
      (req.query.filterTokens as string | undefined)?.split(',') ?? []

    const options: AddressOpinionQueryOptions = {
      latest,
      skip,
      limit,
      orderBy,
      orderDirection,
      filterTokens,
    }

    const addressOpinions = await fetchAddressOpinionsByWalletFromWeb2({
      walletAddress,
      options,
    })

    return handleSuccess(res, addressOpinions)
  } catch (error) {
    console.error('Error occurred while fetching the address opinions', error)
    return handleError(res, error, 'Unable to fetch the address opinions')
  }
}

export async function syncAllAddressOpinions(_req: Request, res: Response) {
  try {
    await syncAllAddressOpinionsInWeb2()

    return handleSuccess(res, {
      message: 'All address opinions have been synced',
    })
  } catch (error) {
    console.error('Error occurred while syncing all address opinions', error)
    return handleError(res, error, 'Unable to sync all address opinions')
  }
}

export async function syncAllNFTOpinions(req: Request, res: Response) {
  try {
    const tokenID = req.body.tokenID ? Number.parseInt(req.body.tokenID) : null
    if (tokenID) {
      await syncOpinionsOfNFTInWeb2(tokenID)
      return handleSuccess(res, {
        message: 'All opinions of an NFT have been synced',
      })
    }

    await syncOpinionsOfAllNFTsInWeb2()
    return handleSuccess(res, {
      message: 'All opinions of all NFTs have been synced',
    })
  } catch (error) {
    console.error('Error occurred while syncing NFT opinions', error)
    return handleError(res, error, 'Unable to sync NFT opinions')
  }
}
