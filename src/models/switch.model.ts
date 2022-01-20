/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

interface ISwitch {
  feature: string
  enabled: boolean
}

interface ISwitchModel extends mongoose.Model<SwitchDocument> {
  build(attr: ISwitch): SwitchDocument
}

interface SwitchDocument extends mongoose.Document {
  feature: string
  enabled: boolean
  createdAt: Date
  updatedAt: Date
}

const SwitchSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true, index: { unique: true } },
    enabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
)

SwitchSchema.statics.build = (attr: ISwitch) => {
  return new SwitchModel(attr)
}

const SwitchModel = mongoose.model<SwitchDocument, ISwitchModel>(
  'Switch',
  SwitchSchema
)

export { ISwitch, SwitchDocument, SwitchModel }
