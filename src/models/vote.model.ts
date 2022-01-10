import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VoteDocument extends Document {
  userId: string
  listing: string
  market: string
  value: number
  createdAt: Date
  updatedAt: Date
}

const VoteSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
      maxlength: 50,
      index: true,
    },
    listing: { type: String, required: true, maxlength: 250, index: true },
    market: { type: String, required: true, maxlength: 250, index: true },
    value: { type: Number, required: true }, // 1 UPVOTE, 0 DOWNVOTE
  },
  {
    timestamps: true,
  }
)

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema)
