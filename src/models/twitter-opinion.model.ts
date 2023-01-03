/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { TwitterCitation } from '../types/twitter-opinion.types'

export interface ITwitterOpinion {
  ratedPostID: string
  ratedBy: string
  ratedAt: Date
  rating: number
  citations: TwitterCitation[]
}

interface ITwitterOpinionModel extends mongoose.Model<TwitterOpinionDocument> {
  build(attr: ITwitterOpinion): TwitterOpinionDocument
}

export interface TwitterOpinionDocument extends mongoose.Document {
  ratedPostID: string
  ratedBy: string
  ratedAt: Date
  rating: number
  citations: TwitterCitation[]
}

const TwitterOpinionSchema = new mongoose.Schema(
  {
    ratedPostID: { type: String, required: true, index: true },
    ratedBy: { type: String, required: true, index: true },
    ratedAt: { type: Date, required: true },
    rating: { type: Number, required: true },
    citations: {
      type: [
        {
          _id: false,
          postID: { type: String, required: true },
          inFavor: { type: Boolean, required: true },
        },
      ],
      default: [],
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
)

TwitterOpinionSchema.index({ ratedPostID: 1 })
TwitterOpinionSchema.index(
  {
    ratedPostID: 1,
    ratedBy: 1,
    ratedAt: 1,
    rating: 1,
    citations: 1,
  },
  { unique: true }
)

TwitterOpinionSchema.statics.build = (attr: ITwitterOpinion) => {
  return new TwitterOpinionModel(attr)
}

export const TwitterOpinionModel = mongoose.model<
  TwitterOpinionDocument,
  ITwitterOpinionModel
>('TwitterOpinion', TwitterOpinionSchema)
