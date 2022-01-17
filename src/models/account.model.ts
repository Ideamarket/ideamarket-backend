/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { VisibilityOptions } from '../types/account.types'

export enum AccountRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface IAccount {
  name?: string
  username?: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  emailVerified?: boolean
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role?: AccountRole
  code?: string | null
  resendCodeTimestamp?: Date | null
}

interface IAccountModel extends mongoose.Model<AccountDocument> {
  build(attr: IAccount): AccountDocument
}

interface AccountDocument extends mongoose.Document {
  name?: string
  username?: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  emailVerified?: boolean
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role: AccountRole
  code?: string | null
  resendCodeTimestamp?: Date | null
  createdAt: Date
  updatedAt: Date
}

const VisibilityOptionsSchema = new mongoose.Schema({
  email: { type: Boolean, default: true },
  bio: { type: Boolean, default: true },
  ethAddress: { type: Boolean, default: true },
})

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String },
    username: { type: String, unique: [true, 'Username is not available'] },
    email: { type: String },
    bio: { type: String },
    profilePhoto: { type: String, default: null },
    emailVerified: { type: Boolean, default: false },
    walletAddress: { type: String, required: true, index: { unique: true } },
    visibilityOptions: VisibilityOptionsSchema,
    role: {
      type: String,
      enum: Object.values(AccountRole),
      default: AccountRole.USER,
    },
    code: { type: String, default: null },
    resendCodeTimestamp: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

AccountSchema.statics.build = (attr: IAccount) => {
  return new AccountModel(attr)
}

const AccountModel = mongoose.model<AccountDocument, IAccountModel>(
  'Account',
  AccountSchema
)

export { AccountModel, AccountDocument }