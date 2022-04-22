/* eslint-disable unicorn/no-keyword-prefix */
import type { FilterQuery } from 'mongoose'

import type { AddressOpinionDocument } from '../models/address-opinion.model'
import { AddressOpinionModel } from '../models/address-opinion.model'
import { AddressOpinionsSummaryModel } from '../models/address-opinions-summary.model'
import type {
  AddressOpinionQueryOptions,
  Web3AddressOpinionData,
} from '../types/address-opinion.types'
import { compareFn } from '../util'
import {
  mapOpinionResponse,
  mapOpinionsSummaryResponse,
  mapOpinionWithSummaryResponse,
} from '../util/addressOpinionUtil'
import { web3 } from '../web3/contract'
import {
  getAllOpinionedAddresses,
  getOpinionsDataOfAddress,
} from '../web3/opinions/address-opinions'
import { InternalServerError } from './errors'

export async function fetchAddressOpinionsByAddressFromWeb2({
  tokenAddress,
  options,
}: {
  tokenAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { latest } = options

  const addressOpinionsByAddress = latest
    ? await fetchLatestAddressOpinionsByAddressFromWeb2({
        tokenAddress,
        options,
      })
    : await fetchAllAddressOpinionsByAddressFromWeb2({ tokenAddress, options })
  const addressOpinionsSummary = await AddressOpinionsSummaryModel.findOne({
    tokenAddress,
  })

  return {
    summary: mapOpinionsSummaryResponse(addressOpinionsSummary),
    addressOpinions: addressOpinionsByAddress,
  }
}

async function fetchLatestAddressOpinionsByAddressFromWeb2({
  tokenAddress,
  options,
}: {
  tokenAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { skip, limit, orderBy } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const addressOpinions = await AddressOpinionModel.aggregate([
    { $match: { tokenAddress } },
    { $sort: { ratedAt: -1 } },
    {
      $group: {
        _id: '$ratedBy',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ])
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return addressOpinions.map((addressOpinion) =>
    mapOpinionResponse(addressOpinion)
  )
}

async function fetchAllAddressOpinionsByAddressFromWeb2({
  tokenAddress,
  options,
}: {
  tokenAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { skip, limit, orderBy } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  // Sorting Options
  const sortOptions: any = {}
  sortOptions[orderBy] = orderDirection

  const addressOpinions = await AddressOpinionModel.find({ tokenAddress })
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)

  return addressOpinions.map((addressOpinion) =>
    mapOpinionResponse(addressOpinion)
  )
}

export async function fetchAddressOpinionsByWalletFromWeb2({
  walletAddress,
  options,
}: {
  walletAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { latest, orderBy, orderDirection, skip, limit } = options

  const addressOpinions = latest
    ? await fetchLatestAddressOpinionsByWalletFromWeb2({
        walletAddress,
        options,
      })
    : await fetchAllAddressOpinionsByWalletFromWeb2({ walletAddress, options })

  const addressOpinionsWithSummaries = []
  for await (const addressOpinion of addressOpinions) {
    const addressOpinionsSummary = await AddressOpinionsSummaryModel.findOne({
      tokenAddress: addressOpinion?.tokenAddress,
    })
    const opinionWithSummary = mapOpinionWithSummaryResponse({
      addressOpinion,
      addressOpinionsSummary,
    })
    if (opinionWithSummary) {
      addressOpinionsWithSummaries.push(opinionWithSummary)
    }
  }

  const addressOpinionsByWallet = addressOpinionsWithSummaries
    .sort((a, b) => compareFn(a, b, orderBy, orderDirection))
    .slice(skip, skip + limit)

  return { addressOpinions: addressOpinionsByWallet }
}

async function fetchLatestAddressOpinionsByWalletFromWeb2({
  walletAddress,
  options,
}: {
  walletAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { filterTokens } = options
  const filterOptions: FilterQuery<AddressOpinionDocument>[] = []
  filterOptions.push({ ratedBy: walletAddress })
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenAddress: { $in: filterTokens } })
  }

  return AddressOpinionModel.aggregate([
    { $match: { $and: filterOptions } },
    { $sort: { ratedAt: -1 } },
    {
      $group: {
        _id: '$tokenAddress',
        doc: { $first: '$$ROOT' },
      },
    },
    { $replaceRoot: { newRoot: '$doc' } },
  ]).sort({ _id: -1 })
}

async function fetchAllAddressOpinionsByWalletFromWeb2({
  walletAddress,
  options,
}: {
  walletAddress: string
  options: AddressOpinionQueryOptions
}) {
  const { filterTokens } = options
  const filterOptions: FilterQuery<AddressOpinionDocument>[] = []
  filterOptions.push({ ratedBy: walletAddress })
  if (filterTokens.length > 0) {
    filterOptions.push({ tokenAddress: { $in: filterTokens } })
  }
  return AddressOpinionModel.find({ $and: filterOptions }).sort({ _id: -1 })
}

export async function syncAllAddressOpinionsInWeb2() {
  try {
    console.log('Fetching all the opinioned addressess')
    const opinionedAddresses = await getAllOpinionedAddresses()

    for await (const address of opinionedAddresses) {
      const opinionedAddress = (address as string).toLowerCase()
      console.log(`Fetching address opinions data of ${opinionedAddress}`)
      const addressOpinionsData = await getOpinionsDataOfAddress(
        opinionedAddress
      )
      const {
        allOpinions,
        averageRating,
        totalRatingsCount,
        latestRatingsCount,
        totalCommentsCount,
        latestCommentsCount,
      } = addressOpinionsData
      // Updating all the opinions of an address in the web2 DB
      console.log(`Updating all the address opinions of ${opinionedAddress}`)
      for await (const opinion of allOpinions) {
        const block = await web3.eth.getBlock(opinion.blockHeight)
        await updateAddressOpinionInWeb2({
          addy: (opinion.addy as string).toLowerCase(),
          author: (opinion.author as string).toLowerCase(),
          timestamp: block.timestamp.toString(),
          rating: opinion.rating,
          comment: opinion.comment,
        })
      }
      // Updating the opinions summary of an address in the web2 DB
      console.log(
        `Updating the address opinions summary of ${opinionedAddress}`
      )
      await AddressOpinionsSummaryModel.findOneAndUpdate(
        { tokenAddress: opinionedAddress },
        {
          $set: {
            averageRating,
            totalRatingsCount,
            latestRatingsCount,
            totalCommentsCount,
            latestCommentsCount,
          },
        },
        { upsert: true, new: true }
      )
    }
  } catch (error) {
    console.error(
      'Error occurred while updating all the opinions from web3 to web2',
      error
    )
    throw new InternalServerError('Failed to update opinions')
  }
}

async function updateAddressOpinionInWeb2(opinionData: Web3AddressOpinionData) {
  try {
    const ratedAt = new Date(Number.parseInt(opinionData.timestamp) * 1000)
    console.log(
      `Handling address opinion of ${opinionData.addy} rated by ${opinionData.author} at ${opinionData.timestamp}`
    )
    const web2AddressOpinion = await AddressOpinionModel.exists({
      tokenAddress: opinionData.addy,
      ratedBy: opinionData.author,
      ratedAt,
      rating: opinionData.rating,
      comment: opinionData.comment,
    })
    if (web2AddressOpinion) {
      return await Promise.resolve(null)
    }
    console.log(
      `Updating address opinion of ${opinionData.addy} rated by ${opinionData.author} at ${opinionData.timestamp}`
    )
    const web2AddressOpinionDoc = AddressOpinionModel.build({
      tokenAddress: opinionData.addy,
      ratedBy: opinionData.author,
      ratedAt,
      rating: Number.parseInt(opinionData.rating),
      comment: opinionData.comment,
    })
    return await AddressOpinionModel.create(web2AddressOpinionDoc)
  } catch (error) {
    console.error(
      'Error occurred while syncing the address opinions from web3 to web2',
      error
    )
    return Promise.resolve(null)
  }
}
