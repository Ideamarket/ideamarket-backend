import config from 'config'
import type { UploadedFile } from 'express-fileupload'

import type { IAccount, AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import { EmailVerificationModel } from '../models/emailVerification.model'
import {
  checkUsernameCanBeUpdatedOrNot,
  mapAccount,
  sendMailForEmailVerification,
} from '../util/accountUtil'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { uploadFileToS3 } from '../util/mediaHandlerUtil'
import { generateRandomNDigitNumber } from '../util/randomUtil'
import type { SignedWalletAddress } from '../util/web3Util'
import { recoverEthAddresses } from '../util/web3Util'
import { EntityNotFoundError, InternalServerError } from './errors'

const s3Bucket: string = config.get('account.s3Bucket')
const cloudFrontDomain: string = config.get('account.cloudFrontDomain')

export async function removeAllUsernamesFromDB(verified: boolean | null) {
  if (verified === null) {
    for await (const accountDoc of AccountModel.find()) {
      await AccountModel.findByIdAndUpdate(accountDoc.id, {
        $unset: { username: '' },
      })
    }
    return
  }

  for await (const accountDoc of AccountModel.find({ verified })) {
    await AccountModel.findByIdAndUpdate(accountDoc.id, {
      $unset: { username: '' },
    })
  }
}

export async function signInAccountAndReturnToken(
  signedWalletAddress: SignedWalletAddress
) {
  let account: AccountDocument | null = null
  let accountCreated = false
  const walletAddress = recoverEthAddresses(signedWalletAddress)

  account = await AccountModel.findOne({ walletAddress })
  if (!account) {
    const accountDoc = AccountModel.build({
      walletAddress,
    })
    account = await AccountModel.create(accountDoc)
    accountCreated = true
  }

  const { authToken, validUntil } = generateAuthToken(account._id.toString())
  if (!authToken) {
    throw new InternalServerError('Error occured while genrating auth token')
  }

  return {
    token: authToken,
    validUntil,
    accountCreated,
    ...mapAccount(account),
  }
}

export async function updateAccountInDB(accountRequest: IAccount) {
  const accountDoc = await AccountModel.findOne({
    walletAddress: accountRequest.walletAddress,
  })

  if (!accountDoc) {
    throw new EntityNotFoundError(null, 'Account do not exist')
  }

  accountDoc.name = accountRequest.name ?? accountDoc.name
  if (
    accountRequest.username &&
    accountRequest.username !== accountDoc.username
  ) {
    if (
      !(await checkUsernameCanBeUpdatedOrNot({
        currentUsername: accountDoc.username,
        usernameToBeChecked: accountRequest.username,
      }))
    ) {
      throw new InternalServerError('Username is already taken')
    }
    accountDoc.username = accountRequest.username
  }
  accountDoc.bio = accountRequest.bio ?? accountDoc.bio
  accountDoc.profilePhoto =
    accountRequest.profilePhoto ?? accountDoc.profilePhoto

  const updatedAccountDoc = await accountDoc.save()

  return mapAccount(updatedAccountDoc)
}

export async function fetchAccountFromDB(accountId: string) {
  const accountDoc = await AccountModel.findById(accountId)
  if (!accountDoc) {
    return null
  }

  return mapAccount(accountDoc)
}

export async function fetchPublicAccountProfileFromDB({
  username,
  walletAddress,
}: {
  username: string | null
  walletAddress: string | null
}) {
  let accountDoc: AccountDocument | null = null
  if (username) {
    accountDoc = await AccountModel.findOne({ username })
  } else if (walletAddress) {
    accountDoc = await AccountModel.findOne({ walletAddress })
  } else {
    accountDoc = null
  }

  if (!accountDoc) {
    return null
  }

  const publicAccountProfile: Partial<AccountDocument> = {}
  publicAccountProfile.name = accountDoc.name
  publicAccountProfile.username = accountDoc.username
  publicAccountProfile.profilePhoto = accountDoc.profilePhoto
  publicAccountProfile.email = accountDoc.email
  publicAccountProfile.bio = accountDoc.bio
  publicAccountProfile.walletAddress = accountDoc.walletAddress

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
