/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { UserTokenDocument } from '../models/user-token.model'

export enum BountyStatus {
  'OPEN' = 'OPEN',
  'CLOSED' = 'CLOSED',
  'CLAIMABLE' = 'CLAIMABLE',
  'CLAIMED' = 'CLAIMED',
}

export interface IBounty {
  contractAddress: string
  bountyID: number
  tokenID: number
  userToken: string
  depositerToken: string
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
}

interface IBountyModel extends mongoose.Model<BountyDocument> {
  build(attr: IBounty): BountyDocument
}

export interface BountyDocument extends mongoose.Document {
  contractAddress: string
  bountyID: number
  tokenID: number
  userToken: UserTokenDocument
  depositerToken: UserTokenDocument
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
}

const BountySchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    bountyID: { type: Number, required: true },
    tokenID: { type: Number, required: true },
    userToken: {
      type: mongoose.Types.ObjectId,
      ref: 'UserToken',
      required: true,
    },
    depositerToken: {
      type: mongoose.Types.ObjectId,
      ref: 'UserToken',
      required: true,
    },
    token: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(BountyStatus),
      default: BountyStatus.OPEN,
      required: true,
    },
    postedAt: { type: Date, required: false },
  },
  { timestamps: true, versionKey: false }
)

BountySchema.index({ contractAddress: 1, bountyID: 1 }, { unique: true })
BountySchema.index({ contractAddress: 1, tokenID: 1 })
BountySchema.index({ contractAddress: 1, userToken: 1 })
BountySchema.index({ contractAddress: 1, depositerToken: 1 })
BountySchema.index({ contractAddress: 1, status: 1 })

BountySchema.statics.build = (attr: IBounty) => {
  return new BountyModel(attr)
}

export const BountyModel = mongoose.model<BountyDocument, IBountyModel>(
  'Bounty',
  BountySchema
)
