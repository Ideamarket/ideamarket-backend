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
  linkAccountAndEmail,
  signInAccountAndReturnToken,
} from '../services/account.service'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

// Sign In Account
export async function signInAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body

    const signedInAccount = await signInAccountAndReturnToken({
      source: reqBody.source,
      signedWalletAddress: reqBody.signedWalletAddress ?? null,
      email: reqBody.email ?? null,
      code: reqBody.code ?? null,
      googleIdToken: reqBody.googleIdToken ?? null,
    })

    return handleSuccess(res, signedInAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to authenticate the account')
  }
}

export async function linkAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const account = await linkAccountAndEmail({
      accountId: decodedAccount.id,
      accountRequest: {
        source: reqBody.source,
        signedWalletAddress: reqBody.signedWalletAddress ?? null,
        email: reqBody.email ?? null,
        code: reqBody.code ?? null,
        googleIdToken: reqBody.googleIdToken ?? null,
      },
    })

    return handleSuccess(res, { account })
  } catch (error) {
    console.error('Error occurred while linking the accounts', error)
    return handleError(res, error, 'Unable to link the account')
  }
}

// Update Account
export async function updateAccount(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const accountRequest: IAccount = {
      email: null,
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
