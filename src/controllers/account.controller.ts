import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { IAccount } from '../models/account.model'
import {
  checkEmailVerificationCode,
  fetchPublicAccountProfileFromDB,
  fetchAccountFromDB,
  sendEmailVerificationCode,
  updateAccountInDB,
  uploadProfilePhoto,
  signInAccountAndReturnToken,
  removeAllUsernamesFromDB,
} from '../services/account.service'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

export async function removeAllUsernames(req: Request, res: Response) {
  try {
    const verified = req.body.verified ?? null

    await removeAllUsernamesFromDB(verified)
    return handleSuccess(res, {
      message: 'All usernames have been removed from DB',
    })
  } catch (error) {
    console.error('Error occurred while removing all the usernames', error)
    return handleError(res, error, 'Unable to remove all the usernames')
  }
}

// Sign In Account
export async function signInAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const signedInAccount = await signInAccountAndReturnToken(
      reqBody.signedWalletAddress
    )

    return handleSuccess(res, signedInAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to authenticate the account')
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
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
    }
    const updatedAccount = await updateAccountInDB(accountRequest)

    return handleSuccess(res, { account: updatedAccount })
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to update the account')
  }
}

// Fetch Account
export async function fetchAccount(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const account = await fetchAccountFromDB(decodedAccount.id)

    return handleSuccess(res, { account })
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to fetch the account')
  }
}

// Fetch Public Account Profile
export async function fetchPublicAccountProfile(req: Request, res: Response) {
  try {
    const username = req.query.username ? (req.query.username as string) : null
    const walletAddress = req.query.walletAddress
      ? (req.query.walletAddress as string)
      : null
    const publicAccountProfile = await fetchPublicAccountProfileFromDB({
      username,
      walletAddress,
    })

    return handleSuccess(res, { account: publicAccountProfile })
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
    const email = req.query.email as string
    await sendEmailVerificationCode(email)

    return handleSuccess(res, {
      messge: 'Please check your email for verification code',
      codeSent: true,
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
      walletAddress: decodedAccount.walletAddress ?? '',
      email: reqBody.email,
      code: reqBody.code,
    })

    if (verificationResponse.codeNotFound) {
      return handleSuccess(res, {
        messge: 'Please request the verification code again',
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
