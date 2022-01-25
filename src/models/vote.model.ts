import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

import type { AccountDocument } from './account.model'
import type { ListingDocument } from './listing.model'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VoteDocument extends Document {
  user: AccountDocument
  listing: ListingDocument
  value: number
  createdAt: Date
  updatedAt: Date
}

const VoteSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: 'Account',
    },
    listing: {
      type: mongoose.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
    },
    value: { type: Number, required: true }, // 1 UPVOTE, -1 DOWNVOTE
  },
  {
    timestamps: true,
  }
)

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema)
