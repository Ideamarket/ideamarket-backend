/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import { ZERO_ADDRESS } from '../util/web3Util'

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface IUserToken {
  name: string | null | undefined
  username?: string | undefined
  twitterUsername?: string | undefined
  twitterUserId?: string | undefined
  email: string | null | undefined
  bio: string | null | undefined
  profilePhoto: string | null | undefined
  walletAddress: string
  role: UserRole
  tokenAddress: string | null | undefined
  marketId: number | null | undefined
  marketName: string | null | undefined
  tokenOwner: string | undefined
  price: number | undefined
  dayChange: number | undefined
  weekChange: number | undefined
  deposits: number | undefined
  holders: number | undefined
  yearIncome: number | undefined
  claimableIncome: number | undefined
  totalRatingsCount: number
  latestRatingsCount: number
}

interface IUserTokenModel extends mongoose.Model<UserTokenDocument> {
  build(attr: IUserToken): UserTokenDocument
}

interface UserTokenDocument extends mongoose.Document {
  name: string | null
  username: string
  twitterUsername: string | null
  twitterUserId: string | null
  email: string | null
  bio: string | null
  profilePhoto: string | null
  walletAddress: string
  role: UserRole
  tokenAddress: string | null
  marketId: number
  marketName: string | null
  tokenOwner: string | null
  price: number
  dayChange: number
  weekChange: number
  deposits: number
  holders: number
  yearIncome: number
  claimableIncome: number
  totalRatingsCount: number
  latestRatingsCount: number
}

const UserTokenSchema = new mongoose.Schema(
  {
    name: { type: String, required: false },
    username: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    twitterUsername: { type: String, required: false },
    twitterUserId: { type: String, required: false },
    email: { type: String, required: false },
    bio: { type: String, required: false },
    profilePhoto: { type: String, default: null },
    walletAddress: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    tokenAddress: { type: String, index: true },
    marketId: { type: Number },
    marketName: { type: String },
    tokenOwner: { type: String, default: ZERO_ADDRESS, required: false },
    price: { type: Number, default: 0, required: true },
    dayChange: { type: Number, default: 0, required: true },
    weekChange: { type: Number, default: 0, required: true },
    deposits: { type: Number, default: 0, required: true },
    holders: { type: Number, default: 0, required: true },
    yearIncome: { type: Number, default: 0, required: true },
    claimableIncome: { type: Number, default: 0, required: true },
    totalRatingsCount: { type: Number, default: 0, required: true },
    latestRatingsCount: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserTokenSchema.statics.build = (attr: IUserToken) => {
  return new UserTokenModel(attr)
}

const UserTokenModel = mongoose.model<UserTokenDocument, IUserTokenModel>(
  'UserToken',
  UserTokenSchema
)

export { UserTokenModel, UserTokenDocument }
