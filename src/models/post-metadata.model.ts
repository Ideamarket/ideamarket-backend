/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IPostMetadata {
  tokenID: number
  minterAddress: string
  content: string
  postedAt: Date | null
  categories: string[]
}

interface IPostMetadataModel extends mongoose.Model<PostMetadataDocument> {
  build(attr: IPostMetadata): PostMetadataDocument
}

export interface PostMetadataDocument extends mongoose.Document {
  tokenID: number
  minterAddress: string
  content: string
  postedAt: Date | null
  categories: string[]
}

const PostMetadataSchema = new mongoose.Schema(
  {
    tokenID: { type: Number, required: true, index: true },
    minterAddress: { type: String, required: true, index: true },
    content: { type: String, required: false },
    postedAt: { type: Date, required: false },
    categories: { type: [String], required: false },
  },
  { timestamps: true, versionKey: false }
)

PostMetadataSchema.statics.build = (attr: IPostMetadata) => {
  return new PostMetadataModel(attr)
}

export const PostMetadataModel = mongoose.model<
  PostMetadataDocument,
  IPostMetadataModel
>('PostMetadata', PostMetadataSchema)
