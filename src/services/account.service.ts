import config from 'config'
import type { UploadedFile } from 'express-fileupload'
import type { TokenPayload } from 'google-auth-library'
import { OAuth2Client } from 'google-auth-library'

import type { IAccount, AccountDocument } from '../models/account.model'
import { AccountModel } from '../models/account.model'
import { EmailVerificationModel } from '../models/emailVerification.model'
import type { AccountRequest } from '../types/account.types'
import { AccountSource } from '../types/account.types'
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
import { BadRequestError, InternalServerError } from './errors'

const GOOGLE_CLIENT_ID = config.get<string>('auth.google.clientId')
const s3Bucket: string = config.get('account.s3Bucket')
const cloudFrontDomain: string = config.get('account.cloudFrontDomain')

const REQ_NOT_VALID_WALLET_SOURCE_MSG =
  'Request is not valid for WALLET account source'
const REQ_NOT_VALID_EMAIL_SOURCE_MSG =
  'Request is not valid for EMAIL account source'
const REQ_NOT_VALID_GOOGLE_SOURCE_MSG =
  'Request is not valid for GOOGLE account source'
const EMAIL_VERIFICATION_CODE_NOT_VALID_MSG = 'Your code is not valid'
const GOOGLE_ID_TOKEN_NOT_VALID_MSG =
  'GoogleIdToken is either expired or invalid'

export type SignInAccount = {
  account: AccountDocument
  accountCreated: boolean
}

export async function signInAccountAndReturnToken(
  accountRequest: AccountRequest
) {
  let signInAccount: SignInAccount
  const { source, signedWalletAddress, email, code, googleIdToken } =
    accountRequest
  switch (source) {
    case AccountSource.WALLET:
      signInAccount = await signInAccountFromWalletSource({
        signedWalletAddress,
      })
      break
    case AccountSource.EMAIL:
      signInAccount = await signInAccountFromEmailSource({ email, code })
      break
    case AccountSource.GOOGLE:
      signInAccount = await signInAccountFromGoogleSource({ googleIdToken })
      break
    default:
      throw new BadRequestError(`Account source - ${source} is not valid `)
  }

  const { authToken, validUntil } = generateAuthToken(
    signInAccount.account._id.toString()
  )
  if (!authToken) {
    throw new InternalServerError('Error occured while genrating auth token')
  }

  return {
    token: authToken,
    validUntil,
    accountCreated: signInAccount.accountCreated,
  }
}

async function signInAccountFromWalletSource({
  signedWalletAddress,
}: {
  signedWalletAddress: SignedWalletAddress | null
}): Promise<SignInAccount> {
  if (!signedWalletAddress) {
    throw new BadRequestError(REQ_NOT_VALID_WALLET_SOURCE_MSG)
  }
  const walletAddress = recoverEthAddresses(signedWalletAddress)

  const account = await AccountModel.findOne({ walletAddress })
  if (account) {
    console.info('Account already exists for this wallet address')
    return { account, accountCreated: false }
  }

  const accountDoc = AccountModel.build({
    walletAddress,
  })
  const createdAccount = await AccountModel.create(accountDoc)
  return { account: createdAccount, accountCreated: true }
}

async function signInAccountFromEmailSource({
  email,
  code,
}: {
  email: string | null
  code: string | null
}): Promise<SignInAccount> {
  if (!email || !code) {
    throw new BadRequestError(REQ_NOT_VALID_EMAIL_SOURCE_MSG)
  }
  const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

  if (
    !emailVerificationDoc ||
    !emailVerificationDoc.code ||
    emailVerificationDoc.code !== code
  ) {
    throw new InternalServerError(EMAIL_VERIFICATION_CODE_NOT_VALID_MSG)
  }
  await EmailVerificationModel.findOneAndDelete({ email })

  const account = await AccountModel.findOne({ email })
  if (account) {
    console.info('Account already exists for this email')
    return { account, accountCreated: false }
  }

  const accountDoc = AccountModel.build({ email })
  const createdAccount = await AccountModel.create(accountDoc)
  return { account: createdAccount, accountCreated: true }
}

async function signInAccountFromGoogleSource({
  googleIdToken,
}: {
  googleIdToken: string | null
}): Promise<SignInAccount> {
  if (!googleIdToken) {
    throw new BadRequestError(REQ_NOT_VALID_GOOGLE_SOURCE_MSG)
  }

  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  let payload: TokenPayload | null | undefined = null
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch (error) {
    console.error(error)
    throw new InternalServerError(GOOGLE_ID_TOKEN_NOT_VALID_MSG)
  }

  if (!payload || !payload.email) {
    throw new InternalServerError(GOOGLE_ID_TOKEN_NOT_VALID_MSG)
  }
  const { email } = payload

  const account = await AccountModel.findOne({ email })
  if (account) {
    console.info('Account already exists for this email')
    return { account, accountCreated: false }
  }

  const accountDoc = AccountModel.build({ email })
  const createdAccount = await AccountModel.create(accountDoc)
  return { account: createdAccount, accountCreated: true }
}

export async function linkAccountAndEmail({
  accountId,
  accountRequest,
}: {
  accountId: string
  accountRequest: AccountRequest
}) {
  let account: AccountDocument | null
  const { source, signedWalletAddress, email, code, googleIdToken } =
    accountRequest
  switch (source) {
    case AccountSource.WALLET:
      account = await linkAccountFromWalletSource({
        accountId,
        signedWalletAddress,
      })
      break
    case AccountSource.EMAIL:
      account = await linkAccountFromEmailSource({ accountId, email, code })
      break
    case AccountSource.GOOGLE:
      account = await linkAccountFromGoogleSource({ accountId, googleIdToken })
      break
    default:
      throw new BadRequestError(`Account source - ${source} is not valid `)
  }

  return mapAccount(account)
}

async function linkAccountFromWalletSource({
  accountId,
  signedWalletAddress,
}: {
  accountId: string
  signedWalletAddress: SignedWalletAddress | null
}) {
  if (!signedWalletAddress) {
    throw new BadRequestError(REQ_NOT_VALID_WALLET_SOURCE_MSG)
  }
  const walletAddress = recoverEthAddresses(signedWalletAddress)
  const account = await AccountModel.findById(accountId)
  if (account?.walletAddress === walletAddress) {
    throw new InternalServerError(
      'Different wallet is already linked to this account'
    )
  }

  return AccountModel.findByIdAndUpdate(
    accountId,
    { $set: { walletAddress } },
    { $new: true }
  )
}

async function linkAccountFromEmailSource({
  accountId,
  email,
  code,
}: {
  accountId: string
  email: string | null
  code: string | null
}) {
  if (!email || !code) {
    throw new BadRequestError(REQ_NOT_VALID_EMAIL_SOURCE_MSG)
  }
  const emailVerificationDoc = await EmailVerificationModel.findOne({ email })

  if (
    !emailVerificationDoc ||
    !emailVerificationDoc.code ||
    emailVerificationDoc.code !== code
  ) {
    throw new InternalServerError(EMAIL_VERIFICATION_CODE_NOT_VALID_MSG)
  }
  await EmailVerificationModel.findOneAndDelete({ email })

  return AccountModel.findByIdAndUpdate(
    accountId,
    { $set: { email } },
    { $new: true }
  )
}

async function linkAccountFromGoogleSource({
  accountId,
  googleIdToken,
}: {
  accountId: string
  googleIdToken: string | null
}) {
  if (!googleIdToken) {
    throw new BadRequestError(REQ_NOT_VALID_GOOGLE_SOURCE_MSG)
  }

  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  let payload: TokenPayload | null | undefined = null
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: googleIdToken,
      audience: GOOGLE_CLIENT_ID,
    })
    payload = ticket.getPayload()
  } catch (error) {
    console.error(error)
    throw new InternalServerError(GOOGLE_ID_TOKEN_NOT_VALID_MSG)
  }

  if (!payload || !payload.email) {
    throw new InternalServerError(GOOGLE_ID_TOKEN_NOT_VALID_MSG)
  }
  const { email } = payload

  return AccountModel.findByIdAndUpdate(
    accountId,
    { $set: { email } },
    { $new: true }
  )
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

export async function fetchAccountFromDB(accountId: string) {
  const accountDoc = await AccountModel.findById(accountId)
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
  if (visibilityOptions.email) {
    publicAccountProfile.email = email
  }
  if (visibilityOptions.bio) {
    publicAccountProfile.bio = bio
  }
  if (visibilityOptions.ethAddress) {
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
