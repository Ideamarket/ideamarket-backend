/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface INFTOpinion {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}

interface INFTOpinionModel extends mongoose.Model<NFTOpinionDocument> {
  build(attr: INFTOpinion): NFTOpinionDocument
}

export interface NFTOpinionDocument extends mongoose.Document {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}

const NFTOpinionSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, index: true },
    tokenID: { type: Number, required: true, index: true },
    ratedBy: { type: String, required: true, index: true },
    ratedAt: { type: Date, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
  },
  { timestamps: true, versionKey: false }
)

NFTOpinionSchema.index({ contractAddress: 1, tokenID: 1 })
NFTOpinionSchema.index(
  {
    contractAddress: 1,
    tokenID: 1,
    ratedBy: 1,
    ratedAt: 1,
    rating: 1,
    comment: 1,
  },
  { unique: true }
)

NFTOpinionSchema.statics.build = (attr: INFTOpinion) => {
  return new NFTOpinionModel(attr)
}

export const NFTOpinionModel = mongoose.model<
  NFTOpinionDocument,
  INFTOpinionModel
>('NFTOpinion', NFTOpinionSchema)