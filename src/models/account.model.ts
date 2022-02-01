/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { VisibilityOptions } from '../types/account.types'

const DefaultVisibilityOptions: VisibilityOptions = {
  email: false,
  bio: true,
  ethAddress: true,
}

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
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role?: AccountRole
  code?: string | null
}

interface IAccountModel extends mongoose.Model<AccountDocument> {
  build(attr: IAccount): AccountDocument
}

interface AccountDocument extends mongoose.Document {
  name?: string
  username: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role: AccountRole
  code?: string | null
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
    walletAddress: { type: String, required: true, index: { unique: true } },
    visibilityOptions: {
      type: VisibilityOptionsSchema,
      default: DefaultVisibilityOptions,
    },
    role: {
      type: String,
      enum: Object.values(AccountRole),
      default: AccountRole.USER,
    },
    code: { type: String, default: null },
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
