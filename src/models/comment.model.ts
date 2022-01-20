import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import type { AccountDocument } from './account.model'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface CommentDocument extends Document {
  user: AccountDocument
  userName: string
  userPicture: string
  listing: string
  market: string
  price: number
  deposits: number
  holders: number
  supply: number
  value: string
  sentiment: string
  feelings: [string]
  isDeleted: boolean
  isModerated: boolean
  moderatedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    userName: { type: String, maxlength: 50 },
    userPicture: { type: String },
    listing: { type: String, required: true, maxlength: 250, index: true },
    market: { type: String, required: true, maxlength: 250, index: true },
    price: { type: Number, default: 0, required: false },
    deposits: { type: Number, default: 0, required: false },
    holders: { type: Number, default: 0, required: false },
    supply: { type: Number, default: 0, required: false },
    value: { type: String, required: true },
    sentiment: { type: String },
    feelings: { type: [String] },
    isDeleted: { type: Boolean, default: false, required: false },
    isModerated: { type: Boolean, default: false, required: false },
    moderatedAt: { type: Date, default: null, required: false },
  },
  {
    timestamps: true,
  }
)

CommentSchema.plugin(mongoosePagination)

export const CommentModel = mongoose.model<CommentDocument>(
  'Comment',
  CommentSchema
)
