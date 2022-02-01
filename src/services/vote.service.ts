import mongoose from 'mongoose'

import { VoteModel } from '../models/vote.model'
import { InternalServerError } from './errors'
import { updateTotalVotesInListing } from './listing.service'

export async function getVoteCount(listingId: string) {
  const listing = new mongoose.Types.ObjectId(listingId)
  try {
    const result = await VoteModel.aggregate([
      { $match: { listing } },
      {
        $group: {
          _id: null,
          votes: { $sum: '$value' },
        },
      },
    ])

    return result.length > 0 ? (result[0].votes as number) : 0
  } catch (error) {
    console.error('Error occured while fetching vote count', error)
    throw new InternalServerError('Unable to fetch vote count')
  }
}

export async function addUpVote({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string
}) {
  try {
    await VoteModel.findOneAndUpdate(
      { listing: listingId, account: accountId },
      { $set: { value: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const totalVotes = await getVoteCount(listingId)
    await updateTotalVotesInListing({ listingId, totalVotes })

    return totalVotes
  } catch (error) {
    console.error('Error occured while up voting the listing', error)
    throw new InternalServerError('Unable to upVote the listing')
  }
}

export async function removeUpVote({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string
}) {
  try {
    await VoteModel.findOneAndDelete({
      listing: listingId,
      account: accountId,
      value: 1,
    })

    const totalVotes = await getVoteCount(listingId)
    await updateTotalVotesInListing({ listingId, totalVotes })

    return totalVotes
  } catch (error) {
    console.error('Error occured while removing upVote of the listing', error)
    throw new InternalServerError('Unable to remove upVote of the listing')
  }
}

export async function addDownVote({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string
}) {
  try {
    await VoteModel.findOneAndUpdate(
      { listing: listingId, account: accountId },
      { $set: { value: -1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const totalVotes = await getVoteCount(listingId)
    await updateTotalVotesInListing({ listingId, totalVotes })

    return totalVotes
  } catch (error) {
    console.error('Error occured while down voting the listing', error)
    throw new InternalServerError('Unable to downVote the listing')
  }
}

export async function removeDownVote({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string
}) {
  try {
    await VoteModel.findOneAndDelete({
      listing: listingId,
      account: accountId,
      value: -1,
    })

    const totalVotes = await getVoteCount(listingId)
    await updateTotalVotesInListing({ listingId, totalVotes })

    return totalVotes
  } catch (error) {
    console.error('Error occured while removing downVote of the listing', error)
    throw new InternalServerError('Unable to remove downVote of the listing')
  }
}

export async function checkUpVotedOrNot({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string | null
}) {
  if (!accountId) {
    return null
  }

  return VoteModel.exists({
    listing: listingId,
    account: accountId,
    value: 1,
  })
}

export async function checkDownVotedOrNot({
  listingId,
  accountId,
}: {
  listingId: string
  accountId: string | null
}) {
  if (!accountId) {
    return null
  }

  return VoteModel.exists({
    listing: listingId,
    account: accountId,
    value: -1,
  })
}
