import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import type { AccountDocument } from './account.model'

export type IGhostListing = {
  user: string
  value: string
  marketId: number
  marketName: string
  walletAddress: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface GhostListingDocument extends Document {
  user: AccountDocument
  value: string
  marketId: number
  marketName: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const GhostListingSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    value: { type: String, required: true },
    marketName: { type: String, required: true, maxlength: 250, index: true },
    marketId: { type: Number, default: 0, required: false },
    address: { type: String },
  },
  {
    timestamps: true,
  }
)

GhostListingSchema.plugin(mongoosePagination)

export const GhostListingModel = mongoose.model<GhostListingDocument>(
  'GhostListing',
  GhostListingSchema
)
