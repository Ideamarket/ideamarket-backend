/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IPostCitedBy {
  contractAddress: string
  tokenID: number
  citedBy: number[]
}

interface IPostCitedByModel extends mongoose.Model<PostCitedByDocument> {
  build(attr: IPostCitedBy): PostCitedByDocument
}

export interface PostCitedByDocument extends mongoose.Document {
  contractAddress: string
  tokenID: number
  citedBy: number[]
}

const PostCitedBySchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, index: true },
    tokenID: { type: Number, required: true, index: true },
    citedBy: { type: [Number], required: false },
  },
  { timestamps: true, versionKey: false }
)

PostCitedBySchema.index({ contractAddress: 1, tokenID: 1 }, { unique: true })

PostCitedBySchema.statics.build = (attr: IPostCitedBy) => {
  return new PostCitedByModel(attr)
}

export const PostCitedByModel = mongoose.model<
  PostCitedByDocument,
  IPostCitedByModel
>('PostCitedBy', PostCitedBySchema)
