/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export type VisibilityOptions = {
  email: boolean
  bio: boolean
  ethAddress: boolean
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
