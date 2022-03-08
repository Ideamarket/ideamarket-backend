/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export enum TwitterVerificationType {
  ACCOUNT = 'ACCOUNT',
  LISTING = 'LISTING',
}

export interface ITwitterVerification {
  verificationType: TwitterVerificationType
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
  twitterUserId?: string
  twitterUsername?: string
  accountId?: string | null | undefined
  listingId?: string | null | undefined
}

interface ITwitterVerificationModel
  extends mongoose.Model<TwitterVerificationDocument> {
  build(attr: ITwitterVerification): TwitterVerificationDocument
}

export interface TwitterVerificationDocument extends mongoose.Document {
  verificationType: TwitterVerificationType
  requestToken: string
  requestTokenSecret: string
  accessToken: string
  accessTokenSecret: string
  twitterUserId: string
  twitterUsername: string
  accountId: string | null
  listingId: string | null
}

export const TwitterVerificationSchema = new mongoose.Schema(
  {
    verificationType: {
      type: String,
      enum: Object.values(TwitterVerificationType),
      required: true,
    },
    requestToken: { type: String, required: true, index: true, unique: true },
    requestTokenSecret: { type: String, required: true },
    accessToken: { type: String, required: false },
    accessTokenSecret: { type: String, required: false },
    twitterUserId: { type: String, required: false },
    twitterUsername: { type: String, required: false },
    accountId: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: false,
    },
    listingId: {
      type: mongoose.Types.ObjectId,
      ref: 'Listing',
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

TwitterVerificationSchema.statics.build = (attr: ITwitterVerification) => {
  return new TwitterVerificationModel(attr)
}

export const TwitterVerificationModel = mongoose.model<
  TwitterVerificationDocument,
  ITwitterVerificationModel
>('TwitterVerification', TwitterVerificationSchema)
