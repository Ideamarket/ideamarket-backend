import config from 'config'
import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface IAprModel {
  value: string
  blockTimestamp: number
  createdAt: Date
  updatedAt: Date
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface AprDocument extends Document {
  value: string
  blockTimestamp: number
  createdAt: Date
  updatedAt: Date
}

const AprSchema = new Schema(
  {
    value: { type: String, index: true },
    blockTimestamp: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const AprModel = mongoose.connection
  .useDb(config.get('lockingDatabaseName'))
  .model<AprDocument>('Apr', AprSchema)
