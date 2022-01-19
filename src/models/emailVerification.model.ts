/* eslint-disable @typescript-eslint/consistent-type-definitions */
import mongoose from 'mongoose'

interface IEmailVerification {
  email: string
  code: string
  resendCodeTimestamp?: Date | null
}

interface IEmailVerificationModel
  extends mongoose.Model<EmailVerificationDocument> {
  build(attr: IEmailVerification): EmailVerificationDocument
}

interface EmailVerificationDocument extends mongoose.Document {
  email: string
  code: string
  resendCodeTimestamp?: Date | null
}

const EmailVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: { unique: true } },
  code: { type: String, required: true },
  resendCodeTimestamp: { type: Date, default: null },
})

EmailVerificationSchema.statics.build = (attr: IEmailVerification) => {
  return new EmailVerificationModel(attr)
}

const EmailVerificationModel = mongoose.model<
  EmailVerificationDocument,
  IEmailVerificationModel
>('EmailVerification', EmailVerificationSchema)

export { IEmailVerification, EmailVerificationDocument, EmailVerificationModel }
