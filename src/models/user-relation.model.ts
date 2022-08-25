/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export type MutualPostObject = {
  postID: number
  mutualDifference: number // The difference in 2 ratings of this post for these 2 users
}

export interface IUserRelation {
  walletAddresses: string[]
  mutualRatedPosts: MutualPostObject[]
  matchScore: number // How similarly 2 users rated their mutually rated posts
}

interface IUserRelationModel extends mongoose.Model<UserRelationDocument> {
  build(attr: IUserRelation): UserRelationDocument
}

interface UserRelationDocument extends mongoose.Document {
  walletAddresses: string[]
  mutualRatedPosts: MutualPostObject[]
  matchScore: number
}

const UserRelationSchema = new mongoose.Schema(
  {
    walletAddresses: {
      type: [String],
      required: true,
      // index: true, // TODO: are these 2 needed?
      // unique: true,
    },
    mutualRatedPosts: {
      type: [],
      default: [],
      required: false,
    },
    matchScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserRelationSchema.statics.build = (attr: IUserRelation) => {
  return new UserRelationModel(attr)
}

const UserRelationModel = mongoose.model<
  UserRelationDocument,
  IUserRelationModel
>('UserRelation', UserRelationSchema)

export { UserRelationModel, UserRelationDocument }
