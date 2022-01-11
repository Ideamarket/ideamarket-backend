/* eslint-disable prefer-destructuring */
import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type {
  IUserAccount,
  VisibilityOptions,
} from '../models/user-accounts.model'
import {
  authenticateUserAndReturnToken,
  createUserAccount,
  fetchPublicUserProfile,
  fetchUserAccount,
  updateUserAccount,
  uploadProfilePhoto,
} from '../services/user-accounts.service'
import type { DECODED_USER } from '../util/jwtTokenUtil'
import type { SignedWalletAddress } from '../util/web3Util'
import { recoverEthAddresses } from '../util/web3Util'

// Authenticate User
export async function authenticateUser(req: Request, res: Response) {
  try {
    const signedWalletAddress: SignedWalletAddress =
      req.body.signedWalletAddress
    const walletAddress = recoverEthAddresses(signedWalletAddress)

    const data = await authenticateUserAndReturnToken(walletAddress)

    return handleSuccess(res, data)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to authenticate the user')
  }
}

// Create User Account
export async function createUser(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const signedWalletAddress: SignedWalletAddress = reqBody.signedWalletAddress
    const walletAddress = recoverEthAddresses(signedWalletAddress)

    const userAccountRequest: IUserAccount = {
      walletAddress,
      name: reqBody.name as string,
      username: reqBody.username as string,
      email: reqBody.email as string,
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
      visibilityOptions: reqBody.visibilityOptions as VisibilityOptions,
    }
    const createdUserAccount = await createUserAccount(userAccountRequest)

    return handleSuccess(res, createdUserAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to create the user account')
  }
}

// Update User Account
export async function updateUser(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const user = (req as any).user as DECODED_USER

    const userAccountRequest: IUserAccount = {
      walletAddress: user.walletAddress,
      name: reqBody.name as string,
      username: reqBody.username as string,
      email: reqBody.email as string,
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
      visibilityOptions: reqBody.visibilityOptions as VisibilityOptions,
    }
    const updatedUserAccount = await updateUserAccount(userAccountRequest)

    return handleSuccess(res, updatedUserAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to update the user account')
  }
}

// Fetch User Account
export async function fetchUser(req: Request, res: Response) {
  try {
    const user = (req as any).user as DECODED_USER
    const userAccount = await fetchUserAccount(user.walletAddress)

    return handleSuccess(res, userAccount)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to fetch the user account')
  }
}

// Fetch User Public Profile
export async function fetchUserPublicProfile(req: Request, res: Response) {
  try {
    const username = req.query.username as string
    const publicUserProfile = await fetchPublicUserProfile(username)

    return handleSuccess(res, publicUserProfile)
  } catch (error) {
    console.error(error)
    return handleError(res, error, "Unable to fetch the user's public profile")
  }
}

// Upload User Profile Photo
export async function uploadUserProfilePhoto(req: Request, res: Response) {
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
