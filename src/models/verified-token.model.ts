import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export type IVerifiedToken = {
  tokenAddress: string
  ownerAddress: string
  chain: string
  tx: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VerifiedTokenDocument extends Document {
  tokenAddress: string
  ownerAddress: string
  chain: string
  tx: string
}

const VerifiedTokenSchema = new Schema(
  {
    tokenAddress: { type: String, required: true, index: true },
    ownerAddress: { type: String, required: true, index: true },
    chain: { type: String },
    tx: { type: String },
  },
  {
    versionKey: false,
  }
)

export const VerifiedTokenModel = mongoose.model<VerifiedTokenDocument>(
  'VerifiedToken',
  VerifiedTokenSchema
)
