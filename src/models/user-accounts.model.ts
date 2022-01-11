/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { VisibilityOptions } from '../types/user-accounts.types'

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface IUserAccount {
  name?: string
  username?: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  emailVerified?: boolean
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role?: UserRole
  code?: string | null
  resendCodeTimestamp?: Date | null
}

interface IUserAccountModel extends mongoose.Model<UserAccountDocument> {
  build(attr: IUserAccount): UserAccountDocument
}

interface UserAccountDocument extends mongoose.Document {
  name?: string
  username?: string
  email?: string
  bio?: string
  profilePhoto?: string | null
  emailVerified?: boolean
  walletAddress: string
  visibilityOptions?: VisibilityOptions
  role: UserRole
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

const UserAccountSchema = new mongoose.Schema(
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
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    code: { type: String, default: null },
    resendCodeTimestamp: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
)

UserAccountSchema.statics.build = (attr: IUserAccount) => {
  return new UserAccountModel(attr)
}

const UserAccountModel = mongoose.model<UserAccountDocument, IUserAccountModel>(
  'UserAccount',
  UserAccountSchema
)

export { UserAccountModel, UserAccountDocument }
