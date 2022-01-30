import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

export type IUrlMetadata = {
  url: string
  ogImage: string | undefined
  ogTitle: string
  ogDescription: string
  ogType: string
  favicon: string | undefined
  expiresAt: Date
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface UrlMetadataDocument extends Document {
  url: string
  ogImage: string
  ogTitle: string
  ogDescription: string
  ogType: string
  favicon: string
  expiresAt: Date
}

const UrlMetadataSchema = new Schema(
  {
    url: { type: String, required: true, index: true },
    ogImage: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogType: { type: String },
    favicon: { type: String },
    expiresAt: { type: Date, required: true },
  },
  {
    versionKey: false,
  }
)

export const UrlMetadataModel = mongoose.model<UrlMetadataDocument>(
  'UrlMetadata',
  UrlMetadataSchema
)
