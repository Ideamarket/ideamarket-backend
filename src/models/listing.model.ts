/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Document, PaginateModel } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import type { AccountDocument } from './account.model'

export type IListing = {
  value: string | undefined
  marketId: number | undefined
  marketName: string | undefined
  isOnchain: boolean
  ghostListedBy: string | null | undefined
  ghostListedByAccount: string | null | undefined
  ghostListedAt: Date | null | undefined
  onchainValue: string | null | undefined
  onchainId: string | null | undefined
  onchainListedBy: string | null | undefined
  onchainListedByAccount: string | null | undefined
  onchainListedAt: Date | null | undefined
  totalVotes: number | undefined
}

interface IListingModel
  extends mongoose.Model<ListingDocument>,
    PaginateModel<ListingDocument> {
  build(attr: IListing): ListingDocument
}

export interface ListingDocument extends Document {
  value: string
  marketId: number
  marketName: string
  isOnchain: boolean
  ghostListedBy: string
  ghostListedByAccount: AccountDocument | null
  ghostListedAt: Date
  onchainValue: string
  onchainId: string
  onchainListedBy: string
  onchainListedByAccount: AccountDocument | null
  onchainListedAt: Date
  totalVotes: number
}

const ListingSchema = new Schema(
  {
    value: { type: String, required: true },
    marketId: { type: Number, required: true, index: true },
    marketName: { type: String, required: true, maxlength: 250, index: true },
    isOnchain: { type: Boolean, default: false, index: true },
    ghostListedBy: { type: String },
    ghostListedByAccount: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: false,
      index: true,
    },
    ghostListedAt: { type: Date, default: null, required: false },
    onchainValue: { type: String },
    onchainId: { type: String, index: true, sparse: true },
    onchainListedBy: { type: String },
    onchainListedByAccount: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: false,
      index: true,
    },
    onchainListedAt: { type: Date, default: null, required: false },
    totalVotes: { type: Number, default: 0, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

ListingSchema.index({ marketId: 1, value: 1 })
ListingSchema.index({ marketId: 1, onchainValue: 1 })
ListingSchema.index(
  { marketId: 1, value: 1, onchainValue: 1 },
  { unique: true }
)

ListingSchema.statics.build = (attr: IListingModel) => {
  return new ListingModel(attr)
}

ListingSchema.plugin(mongoosePagination)

export const ListingModel = mongoose.model<ListingDocument, IListingModel>(
  'Listing',
  ListingSchema
)
