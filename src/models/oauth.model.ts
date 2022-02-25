/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export enum OAuthPlatform {
  TWITTER = 'TWITTER',
}

export interface IOAuth {
  platform: string
  requestToken: string
  requestTokenSecret: string
  accessToken?: string
  accessTokenSecret?: string
}

interface IOAuthModel extends mongoose.Model<OAuthDocument> {
  build(attr: IOAuth): OAuthDocument
}

export interface OAuthDocument extends mongoose.Document {
  platform: string
  requestToken: string
  requestTokenSecret: string
  accessToken: string
  accessTokenSecret: string
}

export const OAuthSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: Object.values(OAuthPlatform),
      required: true,
    },
    requestToken: { type: String, required: true },
    requestTokenSecret: { type: String, required: true },
    accessToken: { type: String, required: false },
    accessTokenSecret: { type: String, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)
OAuthSchema.index({ platform: 1, requestToken: 1 }, { unique: true })

OAuthSchema.statics.build = (attr: IOAuth) => {
  return new OAuthModel(attr)
}

export const OAuthModel = mongoose.model<OAuthDocument, IOAuthModel>(
  'OAuth',
  OAuthSchema
)
