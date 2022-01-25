import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

import type { AccountDocument } from './account.model'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VoteDocument extends Document {
  user: AccountDocument
  listing: string
  market: string
  marketType: string
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
    marketType: { type: String, required: true, maxlength: 20, index: true },
    listing: { type: String, required: true, maxlength: 250, index: true },
    market: { type: String, required: true, maxlength: 250, index: true },
    value: { type: Number, required: true }, // 1 UPVOTE, -1 DOWNVOTE
  },
  {
    timestamps: true,
  }
)

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema)
