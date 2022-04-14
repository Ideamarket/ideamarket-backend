/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

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
  role?: AccountRole
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
  walletAddress: string
  role: AccountRole
  createdAt: Date
  updatedAt: Date
}

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
      enum: Object.values(AccountRole),
      default: AccountRole.USER,
    },
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
