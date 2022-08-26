import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { IUserToken } from '../models/user-token.model'
import {
  checkEmailVerificationCode,
  copyAccountsToUserToken,
  createUserToken,
  fetchAllUserTokensFromWeb2,
  fetchUserHoldersFromWeb2,
  fetchUserHoldingsFromWeb2,
  fetchUserRelationsFromWeb2,
  fetchUserTokenFromDB,
  sendEmailVerificationCode,
  signInUserAndReturnToken,
  syncAllUserRelationsInDB,
  syncUserRelationsForWallet,
  syncUserTokenInWeb2,
  syncUserTokensInWeb2,
  updateUserTokenWeb2ProfileInDB,
  uploadProfilePhoto,
} from '../services/user-token.service'
import type {
  UserHoldersQueryOptions,
  UserHoldingsQueryOptions,
  UserRelationsQueryOptions,
  UserTokenResponse,
  UserTokenResponseWithHoldingAmount,
  UserTokensQueryOptions,
} from '../types/user-token.types'
import type { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

// Create User
export async function syncAccountsToUserTokens(_: Request, res: Response) {
  try {
    await copyAccountsToUserToken()

    return handleSuccess(res, {
      message: 'Accounts have been copied to UserTokens',
    })
  } catch (error) {
    console.error('Error occurred while syncing accounts to user tokens', error)
    return handleError(res, error, 'Unable to sync accounts to user tokens')
  }
}

// Create User
export async function createUser(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const createdUser = await createUserToken(
      reqBody.walletAddress.toLowerCase()
    )

    return handleSuccess(res, createdUser)
  } catch (error) {
    console.error('Error occurred while creating user token', error)
    return handleError(res, error, 'Unable to create the user token')
  }
}

// Sign In User
export async function signInUser(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const signedInUser = await signInUserAndReturnToken(
      reqBody.signedWalletAddress
    )

    return handleSuccess(res, signedInUser)
  } catch (error) {
    console.error('Error occurred while authenticating the user', error)
    return handleError(res, error, 'Unable to authenticate the user')
  }
}

// Update User Token Web2 data
export async function updateUserToken(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const userTokenRequest: Partial<IUserToken> = {
      walletAddress: decodedAccount.walletAddress.toLowerCase(),
      name: reqBody.name as string,
      username: reqBody.username as string,
      bio: reqBody.bio as string,
      profilePhoto: reqBody.profilePhoto as string,
    }
    const updatedUserToken = await updateUserTokenWeb2ProfileInDB(
      userTokenRequest
    )

    return handleSuccess(res, { userToken: updatedUserToken })
  } catch (error) {
    console.error(
      'Error occurred while updating the user token web2 profile',
      error
    )
    return handleError(
      res,
      error,
      'Unable to update the user token web2 profile'
    )
  }
}

// Fetch User Token
export async function fetchUserToken(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | null
      | undefined
    const username = req.query.username ? (req.query.username as string) : null
    const walletAddress = req.query.walletAddress
      ? (req.query.walletAddress as string).toLowerCase()
      : null

    const userToken = await fetchUserTokenFromDB({
      userTokenId: decodedAccount?.id ?? null,
      username,
      walletAddress,
    })

    return handleSuccess(res, { userToken })
  } catch (error) {
    console.error('Error occurred while fetching user token', error)
    return handleError(res, error, 'Unable to fetch the user token')
  }
}

// Fetch User Holders
export async function fetchUserHolders(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | null
      | undefined
    const userTokenId = req.query.userTokenId
      ? (req.query.userTokenId as string)
      : null
    const username = req.query.username ? (req.query.username as string) : null
    const walletAddress = req.query.walletAddress
      ? (req.query.walletAddress as string).toLowerCase()
      : null
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query
      .orderBy as keyof UserTokenResponseWithHoldingAmount
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: UserHoldersQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const holders = await fetchUserHoldersFromWeb2({
      userTokenId: userTokenId ?? decodedAccount?.id ?? null,
      username,
      walletAddress,
      options,
    })

    return handleSuccess(res, { holders })
  } catch (error) {
    console.error('Error occurred while fetching user holders', error)
    return handleError(res, error, 'Unable to fetch the user holders')
  }
}

// Fetch User Holdings
export async function fetchUserHoldings(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | null
      | undefined
    const userTokenId = req.query.userTokenId
      ? (req.query.userTokenId as string)
      : null
    const username = req.query.username ? (req.query.username as string) : null
    const walletAddress = req.query.walletAddress
      ? (req.query.walletAddress as string).toLowerCase()
      : null
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query
      .orderBy as keyof UserTokenResponseWithHoldingAmount
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: UserHoldingsQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const holdings = await fetchUserHoldingsFromWeb2({
      userTokenId: userTokenId ?? decodedAccount?.id ?? null,
      username,
      walletAddress,
      options,
    })

    return handleSuccess(res, { holdings })
  } catch (error) {
    console.error('Error occurred while fetching user holdings', error)
    return handleError(res, error, 'Unable to fetch the user holdings')
  }
}

// Upload UserToken Profile Photo
export async function uploadUserTokenProfilePhoto(req: Request, res: Response) {
  try {
    const files = req.files?.profilePhoto
    if (!files) {
      return handleError(res, null, 'Profile Photo cannot be empty')
    }
    const profilePhoto = Array.isArray(files) ? files[0] : files
    const profilePhotoUrl = await uploadProfilePhoto(profilePhoto)

    return handleSuccess(res, { profilePhotoUrl })
  } catch (error) {
    console.error('Error occurred while uploading the profile photo', error)
    return handleError(res, error, 'Unable to upload the profile photo')
  }
}

// Send UserToken Email Verification Code
export async function sendUserTokenEmailVerificationCode(
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
    console.error('Error occurred while sending email verification code', error)
    return handleError(res, error, 'Unable to send email verification code')
  }
}

// Check UserToken Email Verification COde
export async function checkUserTokenEmailVerificationCode(
  req: Request,
  res: Response
) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const verificationResponse = await checkEmailVerificationCode({
      walletAddress: decodedAccount.walletAddress,
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
    console.error('Error occurred while completing email verification', error)
    return handleError(res, error, 'Unable to complete your email verification')
  }
}

export async function fetchAllUserTokens(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof UserTokenResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null
    const filterWallets =
      (req.query.filterWallets as string | undefined)?.split(',') ?? []

    const options: UserTokensQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      filterWallets,
    }

    const userTokens = await fetchAllUserTokensFromWeb2(options)
    return handleSuccess(res, { userTokens })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the ideamarket posts',
      error
    )
    return handleError(res, error, 'Unable to fetch the ideamarket posts')
  }
}

export async function fetchUserRelations(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | DECODED_ACCOUNT
      | null
      | undefined
    const userTokenId = req.query.userTokenId
      ? (req.query.userTokenId as string)
      : null
    const username = req.query.username ? (req.query.username as string) : null
    const walletAddress = req.query.walletAddress
      ? (req.query.walletAddress as string).toLowerCase()
      : null
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof UserTokenResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: UserRelationsQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const relations = await fetchUserRelationsFromWeb2({
      userTokenId: userTokenId ?? decodedAccount?.id ?? null,
      username,
      walletAddress,
      options,
    })

    return handleSuccess(res, { relations })
  } catch (error) {
    console.error('Error occurred while fetching user relations', error)
    return handleError(res, error, 'Unable to fetch the user relations')
  }
}

export async function syncUserTokens(req: Request, res: Response) {
  try {
    const { walletAddress } = req.body

    if (walletAddress) {
      await syncUserTokenInWeb2(walletAddress.toLowerCase())
      return handleSuccess(res, {
        message: 'Web3 user token has been copied to web2',
      })
    }

    await syncUserTokensInWeb2()
    return handleSuccess(res, {
      message: 'All new web3 user tokens have been copied to web2',
    })
  } catch (error) {
    console.error('Error occurred while syncing user tokens', error)
    return handleError(res, error, 'Unable to sync user tokens')
  }
}

export async function syncUserRelations(req: Request, res: Response) {
  try {
    const { walletAddress, ratedPostID, rating } = req.body

    await syncUserRelationsForWallet({
      walletAddress: walletAddress?.toLowerCase(),
      ratedPostID,
      rating,
    })
    return handleSuccess(res, {
      message: `User relations has been updated for ${walletAddress as string}`,
    })
  } catch (error) {
    console.error('Error occurred while syncing user relations', error)
    return handleError(res, error, 'Unable to sync user relations')
  }
}

export async function syncAllUserRelations(req: Request, res: Response) {
  try {
    await syncAllUserRelationsInDB()
    return handleSuccess(res, {
      message: `All user relations have been updated`,
    })
  } catch (error) {
    console.error('Error occurred while syncing all user relations', error)
    return handleError(res, error, 'Unable to sync all user relations')
  }
}
