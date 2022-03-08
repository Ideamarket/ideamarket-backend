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
  email?: string | null
  bio?: string
  profilePhoto?: string | null
  walletAddress?: string | null
  visibilityOptions?: VisibilityOptions
  role?: AccountRole
  verified?: boolean
}

interface IAccountModel extends mongoose.Model<AccountDocument> {
  build(attr: IAccount): AccountDocument
}

interface AccountDocument extends mongoose.Document {
  name: string
  username: string
  email: string | null
  bio: string
  profilePhoto: string | null
  walletAddress: string | null
  visibilityOptions: VisibilityOptions
  role: AccountRole
  verified: boolean
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
    name: { type: String, required: false },
    username: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    bio: { type: String, required: false },
    profilePhoto: { type: String, default: null },
    walletAddress: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    visibilityOptions: {
      type: VisibilityOptionsSchema,
      default: DefaultVisibilityOptions,
    },
    role: {
      type: String,
      enum: Object.values(AccountRole),
      default: AccountRole.USER,
    },
    verified: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
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
