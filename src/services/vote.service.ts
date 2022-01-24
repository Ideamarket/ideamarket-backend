// eslint-disable-next-line import/order
import mongoose from 'mongoose'
import { VoteModel } from '../models/vote.model'

export async function getVoteCount(listing: string, market: string) {
  try {
    const result = await VoteModel.aggregate([
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

export async function upVote(listing: string, market: string, userId: string) {
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
    await VoteModel.findOneAndUpdate(query, update, options)

    return await getVoteCount(listing, market)

    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

export async function downVote(
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
    await VoteModel.findOneAndUpdate(query, update, options)

    return await getVoteCount(listing, market)
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}
