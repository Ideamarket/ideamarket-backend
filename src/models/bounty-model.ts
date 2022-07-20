/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

// import type { UserTokenDocument } from '../models/user-token.model'

export enum BountyStatus {
  'OPEN' = 'OPEN', // bounty created, but user has not rated that post yet (can use get getBountyAmountPayable and if 0, then it is OPEN)
  'CLAIMABLE' = 'CLAIMABLE', // bounty created AND user has rated that post already
  'CLAIMED' = 'CLAIMED', // bounty has been claimed
}

export interface IBounty {
  contractAddress: string
  bountyID: number
  tokenID: number
  userAddress: string
  depositorAddress: string
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
  fundingBountyIDs: number[] // The bountyIDs that funded this bounty
}

interface IBountyModel extends mongoose.Model<BountyDocument> {
  build(attr: IBounty): BountyDocument
}

export interface BountyDocument extends mongoose.Document {
  contractAddress: string
  bountyID: number
  tokenID: number
  userAddress: string
  depositorAddress: string
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
  fundingBountyIDs: number[]
}

const BountySchema = new mongoose.Schema(
  {
    contractAddress: { type: String, required: true },
    bountyID: { type: Number, required: true },
    tokenID: { type: Number, required: true },
    userAddress: { type: String, required: true },
    depositorAddress: { type: String, required: true },
    token: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(BountyStatus),
      default: BountyStatus.OPEN,
      required: true,
    },
    postedAt: { type: Date, required: false },
    fundingBountyIDs: {
      type: [Number],
      default: [],
      required: false,
    },
  },
  { timestamps: true, versionKey: false }
)

BountySchema.index({ contractAddress: 1, bountyID: 1 }, { unique: true })
BountySchema.index({ contractAddress: 1, tokenID: 1 })
BountySchema.index({ contractAddress: 1, userAddress: 1 })
BountySchema.index({ contractAddress: 1, depositorAddress: 1 })
BountySchema.index({ contractAddress: 1, status: 1 })

BountySchema.statics.build = (attr: IBounty) => {
  return new BountyModel(attr)
}

export const BountyModel = mongoose.model<BountyDocument, IBountyModel>(
  'Bounty',
  BountySchema
)
