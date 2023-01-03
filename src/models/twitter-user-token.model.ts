/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface ITwitterUserToken {
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
  twitterUserId?: string
  twitterUsername?: string
  twitterProfilePicURL?: string
  // totalRatingsCount: number
  // latestRatingsCount: number
}

interface ITwitterUserTokenModel
  extends mongoose.Model<TwitterUserTokenDocument> {
  build(attr: ITwitterUserToken): TwitterUserTokenDocument
}

interface TwitterUserTokenDocument extends mongoose.Document {
  requestToken: string
  requestTokenSecret: string
  accessToken: string
  accessTokenSecret: string
  twitterUserId: string
  twitterUsername: string
  twitterProfilePicURL: string
  // totalRatingsCount: number
  // latestRatingsCount: number
}

const TwitterUserTokenSchema = new mongoose.Schema(
  {
    requestToken: { type: String, required: true, index: true, unique: true },
    requestTokenSecret: { type: String, required: true },
    accessToken: { type: String, required: false },
    accessTokenSecret: { type: String, required: false },
    twitterUserId: { type: String, required: false },
    twitterUsername: { type: String, required: false },
    twitterProfilePicURL: { type: String, required: false },
    // totalRatingsCount: { type: Number, default: 0, required: true },
    // latestRatingsCount: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

TwitterUserTokenSchema.statics.build = (attr: ITwitterUserToken) => {
  return new TwitterUserTokenModel(attr)
}

const TwitterUserTokenModel = mongoose.model<
  TwitterUserTokenDocument,
  ITwitterUserTokenModel
>('TwitterUserToken', TwitterUserTokenSchema)

export { TwitterUserTokenModel, TwitterUserTokenDocument }
