/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { AccountDocument } from './account.model'
import type { ListingDocument } from './listing.model'

export interface IBlacklistedListing {
  listing: string
  onchainId: string | null | undefined
  blacklistedBy: string | null | undefined
}

interface IBlacklistedListingModel
  extends mongoose.Model<BlacklistedListingDocument> {
  build(attr: IBlacklistedListing): BlacklistedListingDocument
}

export interface BlacklistedListingDocument extends mongoose.Document {
  listing: ListingDocument
  onchainId: string | null | undefined
  blacklistedBy: AccountDocument | null | undefined
  createdAt: Date
  updatedAt: Date
}

const BlacklistedListingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Types.ObjectId,
      ref: 'Listing',
      required: true,
      index: true,
      unique: true,
    },
    onchainId: {
      type: String,
      required: false,
      default: null,
      index: true,
      unique: true,
      sparse: true,
    },
    blacklistedBy: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: false,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

BlacklistedListingSchema.statics.build = (attr: IBlacklistedListing) => {
  return new BlacklistedListingModel(attr)
}

export const BlacklistedListingModel = mongoose.model<
  BlacklistedListingDocument,
  IBlacklistedListingModel
>('BlacklistedListing', BlacklistedListingSchema)
