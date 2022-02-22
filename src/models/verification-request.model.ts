import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export type IVerificationRequest = {
  state: string
  tokenAddress: string
  ownerAddress: string
  chain: string
  uuid: string
  weiFee: string
  feeTx: string
  createdAt: number
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface VerificationRequestDocument extends Document {
  state: string
  tokenAddress: string
  ownerAddress: string
  chain: string
  uuid: string
  weiFee: string
  feeTx: string
  createdAt: number
}

const VerificationRequestSchema = new Schema(
  {
    state: { type: String },
    token_address: { type: String, required: true, index: true },
    owner_address: { type: String, required: true, index: true },
    chain: { type: String },
    uuid: { type: String },
    weiFee: { type: String },
    feeTx: { type: String },
    createdAt: { type: Number },
  },
  {
    versionKey: false,
  }
)

export const VerificationRequestModel =
  mongoose.model<VerificationRequestDocument>(
    'VerificationRequest',
    VerificationRequestSchema
  )
