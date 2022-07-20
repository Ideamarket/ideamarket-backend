/* eslint-disable sonarjs/cognitive-complexity */
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllBountiesFromWeb2,
  syncAllBountiesInWeb2,
  // syncBountyInWeb2,
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
    const depositorTokenId = req.query.depositorTokenId
      ? (req.query.depositorTokenId as string)
      : null
    const depositorUsername = req.query.depositorUsername
      ? (req.query.depositorUsername as string)
      : null
    const depositorAddress = req.query.depositorAddress
      ? (req.query.depositorAddress as string).toLowerCase()
      : null
    const filterStatuses =
      (req.query.filterStatuses as string | undefined)?.split(',') ?? []
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
      depositorTokenId,
      depositorUsername,
      depositorAddress,
      filterStatuses,
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
    // const tokenID = req.body.tokenID
    //   ? Number.parseInt(req.body.tokenID)
    //   : null
    // const userAddress = req.body.userAddress
    //   ? req.body.userAddress as string
    //   : null
    // const token = req.body.token
    //   ? req.body.token as string
    //   : null

    // if (tokenID && userAddress && token) {
    //   await syncBountyInWeb2(tokenID, userAddress, token)
    //   return handleSuccess(res, {
    //     message: `Bounty with tokenID=${tokenID} userAddress=${userAddress} token=${token} has been synced`,
    //   })
    // }

    await syncAllBountiesInWeb2()
    return handleSuccess(res, {
      message: 'All bounties have been synced',
    })
  } catch (error) {
    console.error('Error occurred while syncing all the bounties', error)
    return handleError(res, error, 'Unable to sync bounties')
  }
}
