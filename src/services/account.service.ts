import config from 'config'
import type { UploadedFile } from 'express-fileupload'

import type { IAccount, AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import { EmailVerificationModel } from '../models/emailVerification.model'
import {
  checkUsernameCanBeUpdatedOrNot,
  generateRandomUsername,
  mapAccount,
  sendMailForEmailVerification,
} from '../util/accountUtil'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { uploadFileToS3 } from '../util/mediaHandlerUtil'
import { generateRandomNDigitNumber } from '../util/randomUtil'

const s3Bucket: string = config.get('account.s3Bucket')
const cloudFrontDomain: string = config.get('account.cloudFrontDomain')

export async function authenticateAccountAndReturnToken(walletAddress: string) {
  const account = await AccountModel.findOne({ walletAddress })
  if (!account) {
    console.log('Account does not exist')
    return null
  }

  const { authToken, validUntil } = generateAuthToken(walletAddress)
  if (!authToken) {
    throw new Error('Error occured while genrating auth token')
  }

  return { token: authToken, validUntil }
}

export async function createAccountInDB(accountRequest: IAccount) {
  const accountDoc = AccountModel.build({
    username: accountRequest.username ?? (await generateRandomUsername()),
    bio: accountRequest.bio,
    profilePhoto: accountRequest.profilePhoto,
    walletAddress: accountRequest.walletAddress,
  })

  const createdAccountDoc = await AccountModel.create(accountDoc)

  return mapAccount(createdAccountDoc)
}

export async function updateAccountInDB(accountRequest: IAccount) {
  const accountDoc = await AccountModel.findOne({
    walletAddress: accountRequest.walletAddress,
  })

  if (!accountDoc) {
    throw new Error('Account do not exist')
  }

  accountDoc.name = accountRequest.name ?? accountDoc.name
  if (
    accountRequest.username &&
    (await checkUsernameCanBeUpdatedOrNot({
      currentUsername: accountDoc.username,
      usernameToBeChecked: accountRequest.username,
    }))
  ) {
    accountDoc.username = accountRequest.username
  }
  accountDoc.bio = accountRequest.bio ?? accountDoc.bio
  accountDoc.profilePhoto =
    accountRequest.profilePhoto ?? accountDoc.profilePhoto

  const updatedAccountDoc = await accountDoc.save()

  return mapAccount(updatedAccountDoc)
}

export async function fetchAccountFromDB(walletAddress: string) {
  const accountDoc = await AccountModel.findOne({ walletAddress })
  if (!accountDoc) {
    return null
  }

  return mapAccount(accountDoc)
}

export async function fetchPublicAccountProfileFromDB(username: string) {
  const accountDoc = await AccountModel.findOne({ username })
  if (!accountDoc) {
    return null
  }

  const publicAccountProfile: Partial<AccountDocument> = {}
  const { visibilityOptions, email, bio, walletAddress, profilePhoto, name } =
    accountDoc

  publicAccountProfile.name = name
  publicAccountProfile.username = accountDoc.username
  publicAccountProfile.profilePhoto = profilePhoto
  if (visibilityOptions?.email) {
    publicAccountProfile.email = email
  }
  if (visibilityOptions?.bio) {
    publicAccountProfile.bio = bio
  }
  if (visibilityOptions?.ethAddress) {
    publicAccountProfile.walletAddress = walletAddress
  }

  return mapAccount(publicAccountProfile)
}

export async function uploadProfilePhoto(profilePhoto: UploadedFile) {
  const fileName = await uploadFileToS3({
    file: profilePhoto,
    s3Bucket,
  })

  return fileName ? `${cloudFrontDomain}/${fileName}` : null
}

export async function sendEmailVerificationCode(email: string) {
  try {
    let sendVerificationCode = false
    const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

    if (
      !emailVerificationDoc ||
      !emailVerificationDoc.code ||
      !emailVerificationDoc.resendCodeTimestamp ||
      emailVerificationDoc.resendCodeTimestamp.getTime() < Date.now()
    ) {
      sendVerificationCode = true
    }

    if (sendVerificationCode) {
      const code = emailVerificationDoc?.code
        ? emailVerificationDoc.code
        : generateRandomNDigitNumber(6).toString()
      const latestResendCodeTimestamp = new Date(Date.now() + 60 * 1000)

      let updateRecord
      if (emailVerificationDoc) {
        emailVerificationDoc.code = code
        emailVerificationDoc.resendCodeTimestamp = latestResendCodeTimestamp
        updateRecord = emailVerificationDoc.save()
      }
      const addEmailVerificationDoc = EmailVerificationModel.build({
        email,
        code,
        resendCodeTimestamp: latestResendCodeTimestamp,
      })
      updateRecord = EmailVerificationModel.create(addEmailVerificationDoc)

      const sendMail = sendMailForEmailVerification({
        to: email,
        code,
      })
      await Promise.all([updateRecord, sendMail])
    }

    return
  } catch (error) {
    console.error('Error occurred while sending verification code', error)
    throw new Error('Error occurred while sending verification code')
  }
}

export async function checkEmailVerificationCode({
  walletAddress,
  email,
  code,
}: {
  walletAddress: string
  email: string
  code: string
}) {
  const response = {
    codeNotFound: false,
    emailVerified: true,
  }
  try {
    const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

    if (!emailVerificationDoc || !emailVerificationDoc.code) {
      response.codeNotFound = true
      return response
    }

    if (emailVerificationDoc.code !== code) {
      response.emailVerified = false
      return response
    }

    const updateAccount = AccountModel.findOneAndUpdate(
      { walletAddress },
      { $set: { email } }
    )
    const clearEmailVerification = EmailVerificationModel.findOneAndDelete({
      email,
    })
    await Promise.all([updateAccount, clearEmailVerification])

    return response
  } catch (error) {
    console.error('Error occurred while checking verification code', error)
    throw new Error('Error occurred while checking verification code')
  }
}
