import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

import type { AccountDocument } from './account.model'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface GhostListingVoteDocument extends Document {
  user: AccountDocument
  listing: string
  market: string
  value: number
  createdAt: Date
  updatedAt: Date
}

const GhostListingVoteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Account',
    },
    listing: { type: String, required: true, maxlength: 250, index: true },
    market: { type: String, required: true, maxlength: 250, index: true },
    value: { type: Number, required: true }, // 1 UPVOTE, -1 DOWNVOTE
  },
  {
    timestamps: true,
  }
)

export const GhostListingVoteModel = mongoose.model<GhostListingVoteDocument>(
  'GhostListingVote',
  GhostListingVoteSchema
)
