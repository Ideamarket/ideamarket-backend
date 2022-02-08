/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose, { Schema } from 'mongoose'

export enum TriggerType {
  ONCHAIN_LISTING = 'ONCHAIN_LISTING',
}

export interface ITrigger {
  type: TriggerType
  triggerData: any
}

interface ITriggerModel extends mongoose.Model<TriggerDocument> {
  build(attr: ITrigger): TriggerDocument
}

export interface TriggerDocument extends mongoose.Document {
  type: TriggerType
  triggerData: any
}

const TriggerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(TriggerType),
      required: true,
      index: true,
    },
    triggerData: { type: Schema.Types.Mixed },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

TriggerSchema.statics.build = (attr: ITrigger) => {
  return new TriggerModel(attr)
}

export const TriggerModel = mongoose.model<TriggerDocument, ITriggerModel>(
  'Trigger',
  TriggerSchema
)
