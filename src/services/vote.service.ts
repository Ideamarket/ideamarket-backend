// eslint-disable-next-line import/order
import mongoose from 'mongoose'
import { VoteModel } from '../models/vote.model'

export async function getVoteCount(listingId: string) {
  const listing = new mongoose.Types.ObjectId(listingId)
  try {
    const result = await VoteModel.aggregate([
      {
        $match: {
          listing,
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

    return 0
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

export async function upVote(listingId: string, userId: string) {
  try {
    const query = {
      listing: new mongoose.Types.ObjectId(listingId),
      account: new mongoose.Types.ObjectId(userId),
    }
    const update = {
      ...query,
      value: 1,
    }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    await VoteModel.findOneAndUpdate(query, update, options)

    return await getVoteCount(listingId)

    // eslint-disable-next-line no-empty
  } catch {}

  return null
}

export async function downVote(listingId: string, userId: string) {
  try {
    const query = {
      listing: new mongoose.Types.ObjectId(listingId),
      account: new mongoose.Types.ObjectId(userId),
    }
    const update = { ...query, value: -1 }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }
    await VoteModel.findOneAndUpdate(query, update, options)

    return await getVoteCount(listingId)
    // eslint-disable-next-line no-empty
  } catch {}

  return null
}
