/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IAddressOpinionsSummary {
  tokenAddress: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

interface IAddressOpinionsSummaryModel
  extends mongoose.Model<AddressOpinionsSummaryDocument> {
  build(attr: IAddressOpinionsSummary): AddressOpinionsSummaryDocument
}

export interface AddressOpinionsSummaryDocument extends mongoose.Document {
  tokenAddress: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

const AddressOpinionsSummarySchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true, index: true, unique: true },
    averageRating: { type: Number, required: true, default: 0 },
    totalRatingsCount: { type: Number, required: true, default: 0 },
    latestRatingsCount: { type: Number, required: true, default: 0 },
    totalCommentsCount: { type: Number, required: true, default: 0 },
    latestCommentsCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false }
)

AddressOpinionsSummarySchema.statics.build = (
  attr: IAddressOpinionsSummary
) => {
  return new AddressOpinionsSummaryModel(attr)
}

export const AddressOpinionsSummaryModel = mongoose.model<
  AddressOpinionsSummaryDocument,
  IAddressOpinionsSummaryModel
>('AddressOpinionsSummary', AddressOpinionsSummarySchema)
