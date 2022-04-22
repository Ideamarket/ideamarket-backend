/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IAddressOpinion {
  tokenAddress: string
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}

interface IAddressOpinionModel extends mongoose.Model<AddressOpinionDocument> {
  build(attr: IAddressOpinion): AddressOpinionDocument
}

export interface AddressOpinionDocument extends mongoose.Document {
  tokenAddress: string
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}

const AddressOpinionSchema = new mongoose.Schema(
  {
    tokenAddress: { type: String, required: true, index: true },
    ratedBy: { type: String, required: true, index: true },
    ratedAt: { type: Date, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
  },
  { timestamps: true, versionKey: false }
)

AddressOpinionSchema.index(
  { tokenAddress: 1, ratedBy: 1, ratedAt: 1, rating: 1, comment: 1 },
  { unique: true }
)

AddressOpinionSchema.statics.build = (attr: IAddressOpinion) => {
  return new AddressOpinionModel(attr)
}

export const AddressOpinionModel = mongoose.model<
  AddressOpinionDocument,
  IAddressOpinionModel
>('AddressOpinion', AddressOpinionSchema)
