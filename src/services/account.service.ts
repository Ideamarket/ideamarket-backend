import config from 'config'
import type { UploadedFile } from 'express-fileupload'

import type { IAccount, AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
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

  const { authToken, expiresIn } = generateAuthToken(walletAddress)
  if (!authToken) {
    throw new Error('Error occured while genrating auth token')
  }

  return { tokenValue: authToken, tokenExpiry: expiresIn }
}

export async function createAccountInDB(accountRequest: IAccount) {
  const accountDoc = AccountModel.build({
    username: accountRequest.username ?? (await generateRandomUsername()),
    email: accountRequest.email,
    bio: accountRequest.bio,
    profilePhoto: accountRequest.profilePhoto,
    walletAddress: accountRequest.walletAddress,
    visibilityOptions: accountRequest.visibilityOptions,
  })

  const createdAccountDoc = await AccountModel.create(accountDoc)
  const { profilePhoto } = createdAccountDoc
  if (profilePhoto) {
    createdAccountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
  }

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
    await checkUsernameCanBeUpdatedOrNot({
      currentUsername: accountDoc.username,
      usernameToBeChecked: accountRequest.username,
    })
  ) {
    accountDoc.username = accountRequest.username
  }
  if (accountRequest.email && accountDoc.email !== accountRequest.email) {
    accountDoc.email = accountRequest.email
    accountDoc.emailVerified = false
  }
  accountDoc.bio = accountRequest.bio ?? accountDoc.bio
  accountDoc.profilePhoto =
    accountRequest.profilePhoto ?? accountDoc.profilePhoto
  accountDoc.visibilityOptions =
    accountRequest.visibilityOptions ?? accountDoc.visibilityOptions

  const updatedAccountDoc = await accountDoc.save()
  const { profilePhoto } = updatedAccountDoc
  if (profilePhoto) {
    updatedAccountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
  }

  return mapAccount(updatedAccountDoc)
}

export async function fetchAccountFromDB(walletAddress: string) {
  const accountDoc = await AccountModel.findOne({ walletAddress })
  if (!accountDoc) {
    return null
  }

  const { profilePhoto } = accountDoc
  if (profilePhoto) {
    accountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
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
    ? `${cloudFrontDomain}/${profilePhoto}`
    : null
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

export async function sendEmailVerificationCode(walletAddress: string) {
  const response = {
    accountNotFound: false,
    emailMissing: false,
    alreadyVerified: false,
    codeSent: false,
  }

  try {
    const accountDoc = await AccountModel.findOne({ walletAddress })

    if (!accountDoc) {
      response.accountNotFound = true
      return response
    }

    if (!accountDoc.email) {
      response.emailMissing = true
      return response
    }

    if (accountDoc.emailVerified) {
      response.alreadyVerified = true
      return response
    }

    const currentDate = new Date()
    const updateResendCodeTimestamp =
      !accountDoc.code ||
      !accountDoc.resendCodeTimestamp ||
      accountDoc.resendCodeTimestamp.getTime() < currentDate.getTime()
    const sendCode = updateResendCodeTimestamp

    if (!accountDoc.code) {
      const code = generateRandomNDigitNumber(6).toString()
      accountDoc.code = code
    }
    if (updateResendCodeTimestamp) {
      const latestResendCodeTimestamp = new Date(
        currentDate.getTime() + 60 * 1000
      )
      accountDoc.resendCodeTimestamp = latestResendCodeTimestamp
    }

    if (sendCode) {
      const update = accountDoc.save()
      const sendMail = sendMailForEmailVerification({
        to: accountDoc.email,
        code: accountDoc.code,
      })
      await Promise.all([update, sendMail])
    }

    response.codeSent = true
    return response
  } catch (error) {
    console.error('Error occurred while sending verification code', error)
    throw new Error('Error occurred while sending verification code')
  }
}

export async function checkEmailVerificationCode({
  walletAddress,
  code,
}: {
  walletAddress: string
  code: string
}) {
  const response = {
    accountNotFound: false,
    emailMissing: false,
    emailVerified: false,
  }
  try {
    const accountDoc = await AccountModel.findOne({ walletAddress })

    if (!accountDoc) {
      response.accountNotFound = true
      return response
    }

    if (!accountDoc.email) {
      response.emailMissing = true
      return response
    }

    if (accountDoc.emailVerified) {
      return response
    }

    if (code !== accountDoc.code) {
      response.emailVerified = false
      return response
    }

    accountDoc.emailVerified = true
    accountDoc.code = null
    accountDoc.resendCodeTimestamp = null
    await accountDoc.save()
    response.emailVerified = true

    return response
  } catch (error) {
    console.error('Error occurred while checking verification code', error)
    throw new Error('Error occurred while checking verification code')
  }
}
