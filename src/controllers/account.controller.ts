/* eslint-disable prefer-destructuring */
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { IAccount } from '../models/account.model'
import {
  authenticateAccountAndReturnToken,
  checkEmailVerificationCode,
  createAccountInDB,
  fetchPublicAccountProfileFromDB,
  fetchAccountFromDB,
  sendEmailVerificationCode,
  updateAccountInDB,
  uploadProfilePhoto,
} from '../services/account.service'
import type { VisibilityOptions } from '../types/account.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import type { SignedWalletAddress } from '../util/web3Util'
import { recoverEthAddresses } from '../util/web3Util'

// Authenticate Account
export async function authenticateAccount(req: Request, res: Response) {
  try {
    const signedWalletAddress: SignedWalletAddress =
      req.body.signedWalletAddress
    const walletAddress = recoverEthAddresses(signedWalletAddress)

    const data = await authenticateAccountAndReturnToken(walletAddress)

    return handleSuccess(res, data)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to authenticate the account')
  }
}

// Create Account
export async function createAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const signedWalletAddress: SignedWalletAddress = reqBody.signedWalletAddress
    const walletAddress = recoverEthAddresses(signedWalletAddress)

    const accountRequest: IAccount = {
      walletAddress,
      name: reqBody.name as string,
      username: reqBody.username as string,
      email: reqBody.email as string,
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
      visibilityOptions: reqBody.visibilityOptions as VisibilityOptions,
    }
    const createdAccount = await createAccountInDB(accountRequest)

    return handleSuccess(res, createdAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to create the account')
  }
}

// Update Account
export async function updateAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const accountRequest: IAccount = {
      walletAddress: decodedAccount.walletAddress,
      name: reqBody.name as string,
      username: reqBody.username as string,
      email: reqBody.email as string,
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
      visibilityOptions: reqBody.visibilityOptions as VisibilityOptions,
    }
    const updatedAccount = await updateAccountInDB(accountRequest)

    return handleSuccess(res, updatedAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to update the account')
  }
}

// Fetch Account
export async function fetchAccount(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const account = await fetchAccountFromDB(decodedAccount.walletAddress)

    return handleSuccess(res, account)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to fetch the account')
  }
}

// Fetch Public Account Profile
export async function fetchPublicAccountProfile(req: Request, res: Response) {
  try {
    const username = req.query.username as string
    const publicAccountProfile = await fetchPublicAccountProfileFromDB(username)

    return handleSuccess(res, publicAccountProfile)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to fetch the public account profile')
  }
}

// Upload Account Profile Photo
export async function uploadAccountProfilePhoto(req: Request, res: Response) {
  try {
    const files = req.files?.profilePhoto
    if (!files) {
      return handleError(res, null, 'Profile Photo cannot be empty')
    }
    const profilePhoto = Array.isArray(files) ? files[0] : files
    const profilePhotoUrl = await uploadProfilePhoto(profilePhoto)

    return handleSuccess(res, { profilePhotoUrl })
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to upload the profile photo')
  }
}

// Send Account Email Verification Code
export async function sendAccountEmailVerificationCode(
  req: Request,
  res: Response
) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const sendCodeResponse = await sendEmailVerificationCode(
      decodedAccount.walletAddress
    )

    if (sendCodeResponse.accountNotFound) {
      return handleSuccess(res, {
        messge: 'Your account does not exist',
        codeSent: sendCodeResponse.codeSent,
      })
    }

    if (sendCodeResponse.emailMissing) {
      return handleSuccess(res, {
        messge: 'Your email is not connected to your account',
        codeSent: sendCodeResponse.codeSent,
      })
    }

    if (sendCodeResponse.alreadyVerified) {
      return handleSuccess(res, {
        messge: 'Your email has already been verified',
        codeSent: sendCodeResponse.codeSent,
      })
    }

    return handleSuccess(res, {
      messge: 'Please check your email for verification code',
      codeSent: sendCodeResponse.codeSent,
    })
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to send email verification code')
  }
}

// Check Account Email Verification COde
export async function checkAccountEmailVerificationCode(
  req: Request,
  res: Response
) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const verificationResponse = await checkEmailVerificationCode({
      walletAddress: decodedAccount.walletAddress,
      code: reqBody.code,
    })

    if (verificationResponse.accountNotFound) {
      return handleSuccess(res, {
        messge: 'Your account does not exist',
        emailVerified: verificationResponse.emailVerified,
      })
    }

    if (verificationResponse.emailMissing) {
      return handleSuccess(res, {
        messge: 'Your email is not connected to the account',
        emailVerified: verificationResponse.emailVerified,
      })
    }

    if (!verificationResponse.emailVerified) {
      return handleSuccess(res, {
        messge: 'Please check the code you had entered',
        emailVerified: verificationResponse.emailVerified,
      })
    }

    return handleSuccess(res, {
      messge: 'Your email has been verifed',
      emailVerified: verificationResponse.emailVerified,
    })
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to complete your email verification')
  }
}
