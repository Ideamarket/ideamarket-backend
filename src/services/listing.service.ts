/* eslint-disable promise/prefer-await-to-then */

import type { IListing } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import {
  EntityNotFoundError,
  ObjectAlreadyExistsError,
  IllegalStateError,
} from './errors'

export function fetchByMarket(
  marketType: string,
  marketId: number,
  skip = 0,
  limit = 50
) {
  const filter: any = {}

  filter.isOnChain = marketType === 'onchain'

  if (marketId > 0) {
    filter.marketId = marketId
  }

  return ListingModel.paginate(filter, {
    limit,
    offset: skip,
    sort: { createdAt: -1 },
    populate: ['onchainListedByAccount', 'ghostListedByAccount'],
  })
}

export function addNewListing(model: IListing) {
  return new Promise((resolve, reject) => {
    ListingModel.findOne({
      value: model.value,
      marketId: model.marketId,
    })
      .then((m) => {
        if (m) {
          reject(
            new ObjectAlreadyExistsError(null, 'Token has been already listed')
          )
        } else {
          resolve(ListingModel.create(model))
        }
      })
      .then((item) => {
        resolve(item)
      })
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .catch((error) => {
        reject(error)
      })
  })
}

export function updateListingVoteCountById(id: string, totalVotes: number) {
  return new Promise((resolve, reject) => {
    ListingModel.findByIdAndUpdate(
      id,
      {
        totalVotes,
      },
      {
        new: true,
      }
    )
      .then((item) => {
        resolve(item)
      })
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .catch((error) => {
        reject(error)
      })
  })
}

export function migrateGhostToOnChainListing(
  listingId: string,
  model: IListing
) {
  return new Promise((resolve, reject) => {
    ListingModel.findById(listingId)
      .then((m) => {
        if (m && !m.isOnChain) {
          return m
          // eslint-disable-next-line sonarjs/elseif-without-else
        } else if (m?.isOnChain) {
          throw new IllegalStateError(
            'Listing have been already migrated to onchain'
          )
        }

        throw new EntityNotFoundError(
          null,
          `listing not found by id ${listingId}`
        )
      })
      .then(() => {
        return ListingModel.findByIdAndUpdate(
          listingId,
          {
            onchainId: model.onchainId,
            isOnChain: true,
            onchainListedAt: model.onchainListedAt,
            onchainListedBy: model.onchainListedBy,
            onchainListedByAccount: model.onchainListedByAccount,
          },
          {
            new: true,
          }
        )
      })
      .then((item) => {
        resolve(item)
      })
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .catch((error) => {
        reject(error)
      })
  })
}
