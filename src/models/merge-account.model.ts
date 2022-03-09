/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

import type { AccountDocument } from './account.model'

export enum MergeAccountStatus {
  PENDING = 'PENDING',
  COMPLETE = 'COMPLETE',
}

export interface IMergeAccount {
  emailAccount: string
  walletAccount: string
  status: MergeAccountStatus
}

interface IMergeAccountModel extends mongoose.Model<MergeAccountDocument> {
  build(attr: IMergeAccount): MergeAccountDocument
}

export interface MergeAccountDocument extends mongoose.Document {
  emailAccount: AccountDocument
  walletAccount: AccountDocument
  status: MergeAccountStatus
}

const MergeAccountSchema = new mongoose.Schema(
  {
    emailAccount: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    walletAccount: {
      type: mongoose.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(MergeAccountStatus),
      required: true,
      index: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

MergeAccountSchema.statics.build = (attr: IMergeAccount) => {
  return new MergeAccountModel(attr)
}

export const MergeAccountModel = mongoose.model<
  MergeAccountDocument,
  IMergeAccountModel
>('MergeAccount', MergeAccountSchema)
