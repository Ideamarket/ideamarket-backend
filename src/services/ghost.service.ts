/* eslint-disable promise/prefer-await-to-then */

import mongoose from 'mongoose'

import { GhostListingVoteModel } from '../models/ghost-listing-vote.model'
import type { IGhostListing } from '../models/ghost-listing.model'
import { GhostListingModel } from '../models/ghost-listing.model'
import { ObjectAlreadyExistsError } from './errors'

/* eslint-disable import/no-default-export */
async function fetchAllByMarket(marketId: number, skip = 0, limit = 50) {
  const filter: any = {}

  if (marketId > 0) {
    filter.marketId = marketId
  }

  return GhostListingModel.paginate(filter, {
    limit,
    offset: skip,
    sort: { createdAt: -1 },
    populate: 'user',
  })
}

function addNewListing(model: IGhostListing) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    GhostListingModel.findOne({
      value: model.value,
      marketId: model.marketId,
    })
      .then((m) => {
        if (m) {
          reject(new ObjectAlreadyExistsError(model.value))
        }

        return GhostListingModel.create(model)
      })
      .then((item) => {
        resolve(item)
      })
  })
}

export async function getGhostListingVoteCount(
  listing: string,
  market: string
) {
  try {
    const result = await GhostListingVoteModel.aggregate([
      {
        $match: {
          listing,
          market,
        },
      },
      {
        $group: {
          _id: null,
          votes: { $sum: '$value' },
        },
      },
    ])

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (result && result.length > 0) {
      return result[0].votes
    }
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

export async function upVoteGhostListing(
  listing: string,
  market: string,
  userId: string
) {
  try {
    const query = {
      listing,
      market,
      user: new mongoose.Types.ObjectId(userId),
    }
    const update = {
      listing,
      market,
      user: new mongoose.Types.ObjectId(userId),
      value: 1,
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    await GhostListingVoteModel.findOneAndUpdate(query, update, options)

    return await getGhostListingVoteCount(listing, market)

     
  } catch (error) {
    console.log(error)
  }

  return null
}

export async function downVoteGhostListing(
  listing: string,
  market: string,
  userId: string
) {
  try {
    const query = {
      listing,
      market,
      user: new mongoose.Types.ObjectId(userId),
    }
    const update = { ...query, value: -1 }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    await GhostListingVoteModel.findOneAndUpdate(query, update, options)

    return await getGhostListingVoteCount(listing, market)
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

const ghost = {
  fetchAllByMarket,
  addNewListing,
  getGhostListingVoteCount,
  upVoteGhostListing,
  downVoteGhostListing,
}

export default ghost
