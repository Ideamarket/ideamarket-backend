/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/cognitive-complexity */
import config from 'config'
import type { FilterQuery } from 'mongoose'

import type { BountyDocument, BountyStatus } from '../models/bounty-model'
import { BountyModel } from '../models/bounty-model'
import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type { BountyQueryOptions, Web3Bounty } from '../types/bounty-types'
import { mapBountyResponse } from '../util/bountyUtil'
import { getAllBounties, getBounty } from '../web3/bounty'
import { web3 } from '../web3/contract'
import { getDeployedAddresses } from '../web3/deployedAddresses'
import { EntityNotFoundError, InternalServerError } from './errors'

const NETWORK = config.get<string>('web3.network')

export async function fetchAllBountiesFromWeb2({
  contractAddress: _contractAddress,
  options,
}: {
  contractAddress: string | null | undefined
  options: BountyQueryOptions
}) {
  const contractAddress =
    _contractAddress ?? getOpinionBountiesContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for opinion bounties')
    throw new InternalServerError(
      'Contract address is missing for opinion bounties '
    )
  }

  try {
    const {
      skip,
      limit,
      orderBy,
      tokenID,
      userTokenId,
      userAddress,
      username,
      depositerTokenId,
      depositerUsername,
      depositerAddress,
      status,
      startDate,
      endDate,
    } = options

    // Sorting Options
    const sortOptions: any = {}
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<BountyDocument>[] = []
    filterOptions.push({ contractAddress })

    if (tokenID) {
      filterOptions.push({ tokenID })
    }

    let userToken: UserTokenDocument | null = null
    if (userTokenId) {
      userToken = await UserTokenModel.findById(userTokenId)
    } else if (username) {
      userToken = await UserTokenModel.findOne({ username })
    } else if (userAddress) {
      userToken = await UserTokenModel.findOne({ walletAddress: userAddress })
    } else {
      userToken = null
    }
    if ((userTokenId || username || userAddress) && !userToken) {
      console.error('UserToken does not exist in the DB')
      throw new EntityNotFoundError('', 'UserToken does not exist')
    }

    if (userToken) {
      filterOptions.push({ userToken })
    }

    let depositerToken: UserTokenDocument | null = null
    if (depositerTokenId) {
      depositerToken = await UserTokenModel.findById(depositerTokenId)
    } else if (depositerUsername) {
      depositerToken = await UserTokenModel.findOne({
        username: depositerUsername,
      })
    } else if (depositerAddress) {
      depositerToken = await UserTokenModel.findOne({
        walletAddress: depositerAddress,
      })
    } else {
      depositerToken = null
    }
    if (
      (depositerTokenId || depositerUsername || depositerAddress) &&
      !depositerToken
    ) {
      console.error('DepositerToken does not exist in the DB')
      throw new EntityNotFoundError('', 'DepositerToken does not exist')
    }

    if (depositerToken) {
      filterOptions.push({ depositerToken })
    }

    if (status) {
      filterOptions.push({ status })
    }

    if (startDate && endDate) {
      filterOptions.push({ postedAt: { $gte: startDate, $lte: endDate } })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const bounties = await BountyModel.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('userToken')
      .populate('depositerToken')

    return bounties.map((bounty) => mapBountyResponse(bounty))
  } catch (error) {
    console.error(
      'Error occurred while fetching opinion bounties from web2',
      error
    )
    throw new InternalServerError('Failed to fetch opinion bounties from web2')
  }
}

export async function syncAllBountiesInWeb2() {
  const contractAddress = getOpinionBountiesContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for opinion bounties')
    throw new InternalServerError(
      'Contract address is missing for opinion bounties '
    )
  }

  console.log('Fetching all the bounties')
  const allBounties = await getAllBounties()

  for await (const bounty of allBounties) {
    console.log(`Syncing bounty with bountyID=${bounty.bountyID}`)
    const block = await web3.eth.getBlock(bounty.blockHeight)
    await updateBountyInWeb2({
      bounty: {
        bountyID: bounty.bountyID,
        tokenID: bounty.tokenID,
        user: bounty.user.toLowerCase(),
        depositer: bounty.depositer.toLowerCase(),
        token: bounty.token,
        amount: bounty.amount,
        status: bounty.status as BountyStatus,
        timestamp: block.timestamp.toString(),
      },
      contractAddress,
    })
  }
}

export async function syncBountyInWeb2(bountyID: number) {
  const contractAddress = getOpinionBountiesContractAddress()
  if (!contractAddress) {
    console.error('Deployed address is missing for opinion bounties')
    throw new InternalServerError(
      'Contract address is missing for opinion bounties '
    )
  }

  console.log('Fetching the bounty')
  const bounty = await getBounty(bountyID)

  console.log(`Syncing bounty with bountyID=${bountyID}`)
  const block = await web3.eth.getBlock(bounty.blockHeight)
  await updateBountyInWeb2({
    bounty: {
      bountyID: bounty.bountyID,
      tokenID: bounty.tokenID,
      user: bounty.user.toLowerCase(),
      depositer: bounty.depositer.toLowerCase(),
      token: bounty.token,
      amount: bounty.amount,
      status: bounty.status as BountyStatus,
      timestamp: block.timestamp.toString(),
    },
    contractAddress,
  })
}

export async function updateBountyInWeb2({
  bounty,
  contractAddress,
}: {
  bounty: Web3Bounty
  contractAddress: string
}) {
  const postedAt = new Date(Number.parseInt(bounty.timestamp) * 1000)

  console.log(`Fetching user token with walletAddress=${bounty.user}`)
  const userToken = await UserTokenModel.findOne({ walletAddress: bounty.user })

  console.log(`Fetching depositer token with walletAddress=${bounty.user}`)
  const depositerToken = await UserTokenModel.findOne({
    walletAddress: bounty.depositer,
  })

  console.log(`Updating bounty for bountyID=${bounty.bountyID} in web2`)
  await BountyModel.findOneAndUpdate(
    {
      contractAddress,
      bountyID: bounty.bountyID,
    },
    {
      $set: {
        contractAddress,
        bountyID: bounty.bountyID,
        tokenID: bounty.tokenID,
        userToken,
        depositerToken,
        token: bounty.token,
        amount: bounty.amount,
        status: bounty.status,
        postedAt,
      },
    },
    { upsert: true, new: true }
  )
}

export function getOpinionBountiesContractAddress() {
  const opinionBountiesBaseDeployedAddress =
    getDeployedAddresses(NETWORK)?.opinionBounties

  return opinionBountiesBaseDeployedAddress
    ? opinionBountiesBaseDeployedAddress.toLowerCase()
    : undefined
}
