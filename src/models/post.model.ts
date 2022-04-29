/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IPost {
  contractAddress: string
  tokenID: number
  minterAddress: string
  content: string
  isURL: boolean
  categories: string[]
  imageLink: string
  urlContent: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

interface IPostModel extends mongoose.Model<PostDocument> {
  build(attr: IPost): PostDocument
}

export interface PostDocument extends mongoose.Document {
  contractAddress: string
  tokenID: number
  minterAddress: string
  content: string
  isURL: boolean
  categories: string[]
  imageLink: string
  urlContent: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

const PostSchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true, index: true },
    tokenID: { type: Number, required: true, index: true },
    minterAddress: { type: String, required: true, index: true },
    content: { type: String, required: false },
    isURL: { type: Boolean, required: true },
    categories: { type: [String], required: false },
    imageLink: { type: String, required: false },
    urlContent: { type: String, required: false },
    averageRating: { type: Number, required: true, default: 0 },
    totalRatingsCount: { type: Number, required: true, default: 0 },
    latestRatingsCount: { type: Number, required: true, default: 0 },
    totalCommentsCount: { type: Number, required: true, default: 0 },
    latestCommentsCount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, versionKey: false }
)

PostSchema.index({ contractAddress: 1, tokenID: 1 }, { unique: true })

PostSchema.statics.build = (attr: IPost) => {
  return new PostModel(attr)
}

export const PostModel = mongoose.model<PostDocument, IPostModel>(
  'Post',
  PostSchema
)
