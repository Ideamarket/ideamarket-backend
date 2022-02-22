import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export type IVerifiedToken = {
  token_address: string
  owner_address: string
  chain: string
  tx: string
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VerifiedTokenDocument extends Document {
  token_address: string
  owner_address: string
  chain: string
  tx: string
}

const VerifiedTokenSchema = new Schema(
  {
    token_address: { type: String, required: true, index: true },
    owner_address: { type: String, required: true, index: true },
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
