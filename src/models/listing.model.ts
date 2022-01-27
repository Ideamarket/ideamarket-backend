/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Document, PaginateModel } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import type { AccountDocument } from './account.model'

export type IListing = {
  ghostListedByAccount: string | null | undefined
  ghostListedBy: string | null | undefined
  value: string | undefined
  marketId: number | undefined
  marketName: string | undefined
  onchainId: string | null | undefined
  isOnChain: boolean
  onchainListedBy: string | null | undefined
  onchainListedAt: Date | null | undefined
  ghostListedAt: Date | null | undefined
}

export interface ListingDocument extends Document {
  ghostListedByAccount: AccountDocument
  ghostListedBy: string
  value: string
  marketId: number
  marketName: string
  onchainId: string
  isOnChain: boolean
  onchainListedBy: string
  onchainListedAt: Date
  ghostListedAt: Date
}

const ListingSchema = new Schema(
  {
    ghostListedByAccount: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: false,
      index: true,
    },
    ghostListedBy: { type: String },
    value: { type: String, required: true },
    marketName: { type: String, required: true, maxlength: 250, index: true },
    marketId: { type: Number, required: true, index: true },
    totalVotes: { type: Number, default: 0, required: true },
    isOnChain: { type: Boolean, default: false, index: true },
    onchainId: { type: String, index: true, sparse: true },
    onchainListedBy: { type: String },
    onchainListedAt: { type: Date, default: null, required: false },
    ghostListedAt: { type: Date, default: null, required: false },
  },
  {
    timestamps: true,
  }
)

interface IListingModel
  extends mongoose.Model<ListingDocument>,
    PaginateModel<ListingDocument> {
  build(attr: IListing): ListingDocument
}

ListingSchema.statics.build = (attr: IListingModel) => {
  return new ListingModel(attr)
}

ListingSchema.index({ value: 1, marketId: 1 }, { unique: true })

ListingSchema.plugin(mongoosePagination)

export const ListingModel = mongoose.model<ListingDocument, IListingModel>(
  'Listing',
  ListingSchema
)
