/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface ITwitterVerification {
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
  twitterUserId?: string
  twitterUsername?: string
  userTokenId?: string | null | undefined
}

interface ITwitterVerificationModel
  extends mongoose.Model<TwitterVerificationDocument> {
  build(attr: ITwitterVerification): TwitterVerificationDocument
}

export interface TwitterVerificationDocument extends mongoose.Document {
  requestToken: string
  requestTokenSecret: string
  accessToken: string
  accessTokenSecret: string
  twitterUserId: string
  twitterUsername: string
  userTokenId: string | null
}

export const TwitterVerificationSchema = new mongoose.Schema(
  {
    requestToken: { type: String, required: true, index: true, unique: true },
    requestTokenSecret: { type: String, required: true },
    accessToken: { type: String, required: false },
    accessTokenSecret: { type: String, required: false },
    twitterUserId: { type: String, required: false },
    twitterUsername: { type: String, required: false },
    userTokenId: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
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
