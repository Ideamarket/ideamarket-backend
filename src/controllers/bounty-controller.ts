/* eslint-disable sonarjs/cognitive-complexity */
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { BountyStatus } from '../models/bounty-model'
import {
  fetchAllBountiesFromWeb2,
  syncAllBountiesInWeb2,
  syncBountyInWeb2,
} from '../services/bounty-service'
import type { BountyQueryOptions, BountyResponse } from '../types/bounty-types'

export async function fetchAllBounties(req: Request, res: Response) {
  try {
    const contractAddress = req.query.contractAddress
      ? (req.query.contractAddress as string)
      : null
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof BountyResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const tokenID = req.query.tokenID
      ? Number.parseInt(req.query.tokenID as string)
      : null
    const userTokenId = req.query.userTokenId
      ? (req.query.userTokenId as string)
      : null
    const username = req.query.username ? (req.query.username as string) : null
    const userAddress = req.query.userAddress
      ? (req.query.userAddress as string).toLowerCase()
      : null
    const depositerTokenId = req.query.depositerTokenId
      ? (req.query.depositerTokenId as string)
      : null
    const depositerUsername = req.query.depositerUsername
      ? (req.query.depositerUsername as string)
      : null
    const depositerAddress = req.query.depositerAddress
      ? (req.query.depositerAddress as string).toLowerCase()
      : null
    const status = req.query.status
      ? (req.query.status as string as BountyStatus)
      : null
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null
    if (startDate) {
      startDate.setUTCHours(0, 0, 0, 0)
    }
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null
    if (endDate) {
      endDate.setUTCHours(23, 59, 59, 999)
    }

    const options: BountyQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      tokenID,
      userTokenId,
      username,
      userAddress,
      depositerTokenId,
      depositerUsername,
      depositerAddress,
      status,
      startDate,
      endDate,
    }

    const bounties = await fetchAllBountiesFromWeb2({
      contractAddress,
      options,
    })
    return handleSuccess(res, bounties)
  } catch (error) {
    console.error('Error occurred while fetching all the bounties', error)
    return handleError(res, error, 'Unable to fetch the bounties')
  }
}

export async function syncAllBounties(req: Request, res: Response) {
  try {
    const bountyID = req.body.bountyID
      ? Number.parseInt(req.body.bountyID)
      : null

    if (bountyID) {
      await syncBountyInWeb2(bountyID)
      return handleSuccess(res, {
        message: `Bounty with bountyID=${bountyID} has been synced`,
      })
    }

    await syncAllBountiesInWeb2()
    return handleSuccess(res, {
      message: 'All bounties have been synced',
    })
  } catch (error) {
    console.error('Error occurred while syncing all the bounties', error)
    return handleError(res, error, 'Unable to sync bounties')
  }
}
