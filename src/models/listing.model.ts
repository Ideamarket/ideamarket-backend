/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Document, PaginateModel } from 'mongoose'
import mongoose, { Schema } from 'mongoose'
import mongoosePagination from 'mongoose-paginate'

import { ZERO_ADDRESS } from '../util/web3Util'
import type { AccountDocument } from './account.model'
import type { CategoryDocument } from './category.model'

export type IListing = {
  value: string | undefined
  marketId: number | undefined
  marketName: string | undefined
  categories: string[]
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
  onchainOwner: string | null | undefined
  price: number | undefined
  dayChange: number | undefined
  weekChange: number | undefined
  deposits: number | undefined
  holders: number | undefined
  yearIncome: number | undefined
  claimableIncome: number | undefined
  verified: boolean | null | undefined
  averageRating: number | undefined
  latestRatingsCount: number | undefined
  latestCommentsCount: number | undefined
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
  categories: CategoryDocument[]
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
  onchainOwner: string
  price: number
  dayChange: number
  weekChange: number
  deposits: number
  holders: number
  yearIncome: number
  claimableIncome: number
  verified: boolean | null
  averageRating: number
  latestRatingsCount: number
  latestCommentsCount: number
}

const ListingSchema = new Schema(
  {
    value: { type: String, required: true },
    marketId: { type: Number, required: true, index: true },
    marketName: { type: String, required: true, maxlength: 250, index: true },
    categories: {
      type: [
        {
          type: mongoose.Types.ObjectId,
          ref: 'Category',
        },
      ],
      default: [],
      required: false,
      index: true,
    },
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
    onchainOwner: { type: String, default: ZERO_ADDRESS, required: false },
    price: { type: Number, default: 0, required: true },
    dayChange: { type: Number, default: 0, required: true },
    weekChange: { type: Number, default: 0, required: true },
    deposits: { type: Number, default: 0, required: true },
    holders: { type: Number, default: 0, required: true },
    yearIncome: { type: Number, default: 0, required: true },
    claimableIncome: { type: Number, default: 0, required: true },
    verified: { type: Boolean, default: null, required: false },
    averageRating: { type: Number, default: 0, required: true },
    latestRatingsCount: { type: Number, default: 0, required: true },
    latestCommentsCount: { type: Number, default: 0, required: true },
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

ListingSchema.index({ marketId: 1, price: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, price: -1 })

ListingSchema.index({ marketId: 1, dayChange: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, dayChange: -1 })

ListingSchema.index({ marketId: 1, weekChange: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, weekChange: -1 })

ListingSchema.index({ marketId: 1, deposits: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, deposits: -1 })

ListingSchema.index({ marketId: 1, holders: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, holders: -1 })

ListingSchema.index({ marketId: 1, yearIncome: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, yearIncome: -1 })

ListingSchema.index({ marketId: 1, totalVotes: -1 })
ListingSchema.index({ isOnchain: 1, marketId: 1, totalVotes: -1 })

ListingSchema.statics.build = (attr: IListingModel) => {
  return new ListingModel(attr)
}

ListingSchema.plugin(mongoosePagination)

export const ListingModel = mongoose.model<ListingDocument, IListingModel>(
  'Listing',
  ListingSchema
)
