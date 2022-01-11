import config from 'config'
import type { UploadedFile } from 'express-fileupload'

import type {
  IUserAccount,
  UserAccountDocument,
} from '../models/user-accounts.model'
import { UserAccountModel } from '../models/user-accounts.model'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { uploadFileToS3 } from '../util/mediaHandlerUtil'
import { generateRandomNDigitNumber } from '../util/randomUtil'
import {
  checkUsernameCanBeUpdatedOrNot,
  generateRandomUsername,
  mapUserAccount,
  sendMailForEmailVerification,
} from '../util/userUtil'

const s3Bucket: string = config.get('userAccounts.s3Bucket')
const cloudFrontDomain: string = config.get('userAccounts.cloudFrontDomain')

export async function authenticateUserAndReturnToken(walletAddress: string) {
  const userAccount = await UserAccountModel.findOne({ walletAddress })
  if (!userAccount) {
    console.log('User account does not exist')
    return null
  }

  const { authToken, expiresIn } = generateAuthToken(walletAddress)
  if (!authToken) {
    throw new Error('Error occured while genrating auth token')
  }

  return { tokenValue: authToken, tokenExpiry: expiresIn }
}

export async function createUserAccount(userAccountRequest: IUserAccount) {
  const userAccountDoc = UserAccountModel.build({
    username: userAccountRequest.username ?? (await generateRandomUsername()),
    email: userAccountRequest.email,
    bio: userAccountRequest.bio,
    profilePhoto: userAccountRequest.profilePhoto,
    walletAddress: userAccountRequest.walletAddress,
    visibilityOptions: userAccountRequest.visibilityOptions,
  })

  const createdUserAccountDoc = await UserAccountModel.create(userAccountDoc)
  const { profilePhoto } = createdUserAccountDoc
  if (profilePhoto) {
    createdUserAccountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
  }

  return mapUserAccount(createdUserAccountDoc)
}

export async function updateUserAccount(userAccountRequest: IUserAccount) {
  const userAccountDoc = await UserAccountModel.findOne({
    walletAddress: userAccountRequest.walletAddress,
  })

  if (!userAccountDoc) {
    throw new Error('User account do not exist')
  }

  userAccountDoc.name = userAccountRequest.name ?? userAccountDoc.name
  if (
    await checkUsernameCanBeUpdatedOrNot({
      currentUsername: userAccountDoc.username,
      usernameToBeChecked: userAccountRequest.username,
    })
  ) {
    userAccountDoc.username = userAccountRequest.username
  }
  if (
    userAccountRequest.email &&
    userAccountDoc.email !== userAccountRequest.email
  ) {
    userAccountDoc.email = userAccountRequest.email
    userAccountDoc.emailVerified = false
  }
  userAccountDoc.bio = userAccountRequest.bio ?? userAccountDoc.bio
  userAccountDoc.profilePhoto =
    userAccountRequest.profilePhoto ?? userAccountDoc.profilePhoto
  userAccountDoc.visibilityOptions =
    userAccountRequest.visibilityOptions ?? userAccountDoc.visibilityOptions

  const updatedUserAccountDoc = await userAccountDoc.save()
  const { profilePhoto } = updatedUserAccountDoc
  if (profilePhoto) {
    updatedUserAccountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
  }

  return mapUserAccount(updatedUserAccountDoc)
}

export async function fetchUserAccount(walletAddress: string) {
  const userAccountDoc = await UserAccountModel.findOne({ walletAddress })
  if (!userAccountDoc) {
    return null
  }

  const { profilePhoto } = userAccountDoc
  if (profilePhoto) {
    userAccountDoc.profilePhoto = profilePhoto
      ? `${cloudFrontDomain}/${profilePhoto}`
      : null
  }

  return mapUserAccount(userAccountDoc)
}

export async function fetchPublicUserProfile(username: string) {
  const userAccountDoc = await UserAccountModel.findOne({ username })
  if (!userAccountDoc) {
    return null
  }

  const publicUserProfile: Partial<UserAccountDocument> = {}
  const { visibilityOptions, email, bio, walletAddress, profilePhoto, name } =
    userAccountDoc

  publicUserProfile.name = name
  publicUserProfile.username = userAccountDoc.username
  publicUserProfile.profilePhoto = profilePhoto
    ? `${cloudFrontDomain}/${profilePhoto}`
    : null
  if (visibilityOptions?.email) {
    publicUserProfile.email = email
  }
  if (visibilityOptions?.bio) {
    publicUserProfile.bio = bio
  }
  if (visibilityOptions?.ethAddress) {
    publicUserProfile.walletAddress = walletAddress
  }

  return mapUserAccount(publicUserProfile)
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
    const userAccountDoc = await UserAccountModel.findOne({ walletAddress })

    if (!userAccountDoc) {
      response.accountNotFound = true
      return response
    }

    if (!userAccountDoc.email) {
      response.emailMissing = true
      return response
    }

    if (userAccountDoc.emailVerified) {
      response.alreadyVerified = true
      return response
    }

    const currentDate = new Date()
    const updateResendCodeTimestamp =
      !userAccountDoc.code ||
      !userAccountDoc.resendCodeTimestamp ||
      userAccountDoc.resendCodeTimestamp.getTime() < currentDate.getTime()
    const sendCode = updateResendCodeTimestamp

    if (!userAccountDoc.code) {
      const code = generateRandomNDigitNumber(6).toString()
      userAccountDoc.code = code
    }
    if (updateResendCodeTimestamp) {
      const latestResendCodeTimestamp = new Date(
        currentDate.getTime() + 60 * 1000
      )
      userAccountDoc.resendCodeTimestamp = latestResendCodeTimestamp
    }

    if (sendCode) {
      const update = userAccountDoc.save()
      const sendMail = sendMailForEmailVerification({
        to: userAccountDoc.email,
        code: userAccountDoc.code,
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
    const userAccountDoc = await UserAccountModel.findOne({ walletAddress })

    if (!userAccountDoc) {
      response.accountNotFound = true
      return response
    }

    if (!userAccountDoc.email) {
      response.emailMissing = true
      return response
    }

    if (userAccountDoc.emailVerified) {
      return response
    }

    if (code !== userAccountDoc.code) {
      response.emailVerified = false
      return response
    }

    userAccountDoc.emailVerified = true
    userAccountDoc.code = null
    userAccountDoc.resendCodeTimestamp = null
    await userAccountDoc.save()
    response.emailVerified = true

    return response
  } catch (error) {
    console.error('Error occurred while checking verification code', error)
    throw new Error('Error occurred while checking verification code')
  }
}
