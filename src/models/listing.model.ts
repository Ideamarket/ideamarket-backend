import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import type { AccountDocument } from './account.model'

export type IListing = {
  account: string
  value: string
  listingId: string | null
  marketId: number
  marketName: string
  marketType: string
  address: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface ListingDocument extends Document {
  account: AccountDocument
  value: string
  listingId: string
  marketId: number
  marketName: string
  marketType: string
  address: string
  createdAt: Date
  updatedAt: Date
}

const ListingSchema = new Schema(
  {
    account: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    listingId: { type: String, index: true, unique: true },
    value: { type: String, required: true },
    marketName: { type: String, required: true, maxlength: 250, index: true },
    marketType: {
      type: String,
      required: true,
      enum: ['ghost', 'onchain'],
      maxlength: 25,
      index: true,
    },
    marketId: { type: Number, required: true, index: true },
    address: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

ListingSchema.plugin(mongoosePagination)

export const ListingModel = mongoose.model<ListingDocument>(
  'Listing',
  ListingSchema
)
