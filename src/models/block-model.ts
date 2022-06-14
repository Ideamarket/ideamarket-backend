/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

export interface IBlock {
  contractAddress: string
  startBlock: number
  endBlock: number | null
}

interface IBlockModel extends mongoose.Model<BlockDocument> {
  build(attr: IBlock): BlockDocument
}

export interface BlockDocument extends mongoose.Document {
  contractAddress: string
  startBlock: number
  endBlock: number | null
}

const BlockSchema = new mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    startBlock: { type: Number, required: true },
    endBlock: { type: Number, required: false },
  },
  { timestamps: true, versionKey: false }
)

BlockSchema.index({ contractAddress: 1, tokenID: 1 }, { unique: true })

BlockSchema.statics.build = (attr: IBlock) => {
  return new BlockModel(attr)
}

export const BlockModel = mongoose.model<BlockDocument, IBlockModel>(
  'Block',
  BlockSchema
)
