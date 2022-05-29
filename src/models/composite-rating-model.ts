/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { PostDocument } from './post.model'

export interface ICompositeRating {
  post: PostDocument
  tokenID: number
  rating: number
  date: string
  timestamp: Date
}

interface ICompositeRatingModel
  extends mongoose.Model<CompositeRatingDocument> {
  build(attr: ICompositeRating): CompositeRatingDocument
}

export interface CompositeRatingDocument extends mongoose.Document {
  post: PostDocument
  tokenID: number
  rating: number
  date: string
  timestamp: Date
}

const CompositeRatingSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Types.ObjectId,
      ref: 'Post',
      required: false,
      index: true,
    },
    tokenID: { type: Number, required: true, index: true },
    rating: { type: Number, required: true },
    date: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false }
)

CompositeRatingSchema.index(
  {
    post: 1,
    tokenID: 1,
    timestamp: 1,
  },
  { unique: true }
)

CompositeRatingSchema.statics.build = (attr: ICompositeRating) => {
  return new CompositeRatingModel(attr)
}

export const CompositeRatingModel = mongoose.model<
  CompositeRatingDocument,
  ICompositeRatingModel
>('CompositeRating', CompositeRatingSchema)
