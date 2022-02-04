import config from 'config'
import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface LPAprDocument extends Document {
  value: string
  valueAsHex: string
  blockTimestamp: number
  createdAt: Date
  updatedAt: Date
}

const LPAprSchema = new Schema(
  {
    value: { type: String, index: true },
    valueAsHex: { type: String },
    blockTimestamp: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const LPAprModel = mongoose.connection
  .useDb(config.get('lockingDatabaseName'))
  .model<LPAprDocument>('LPApr', LPAprSchema)
