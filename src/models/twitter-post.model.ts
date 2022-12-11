/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface ITwitterPost {
  twitterUsername: string
  content: string
  postedAt: Date | null
  categories: string[]
  averageRating: number
  compositeRating: number
  marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
}

interface ITwitterPostModel extends mongoose.Model<TwitterPostDocument> {
  build(attr: ITwitterPost): TwitterPostDocument
}

export interface TwitterPostDocument extends mongoose.Document {
  twitterUsername: string
  content: string
  postedAt: Date | null
  categories: string[]
  averageRating: number
  compositeRating: number
  marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
}

const TwitterPostSchema = new mongoose.Schema(
  {
    twitterUsername: { type: String, required: true, index: true },
    content: { type: String, required: false },
    postedAt: { type: Date, required: false },
    categories: { type: [String], required: false },
    averageRating: { type: Number, required: true, default: 0 },
    compositeRating: { type: Number, required: true, default: 0 },
    marketInterest: { type: Number, required: true, default: 0 },
    totalRatingsCount: { type: Number, required: true, default: 0 },
    latestRatingsCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false }
)

TwitterPostSchema.index({ contractAddress: 1, tokenID: 1 }, { unique: true })

TwitterPostSchema.statics.build = (attr: ITwitterPost) => {
  return new TwitterPostModel(attr)
}

export const TwitterPostModel = mongoose.model<
  TwitterPostDocument,
  ITwitterPostModel
>('TwitterPost', TwitterPostSchema)
