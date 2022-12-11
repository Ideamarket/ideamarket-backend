import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllTwitterUserTokensFromWeb2,
  fetchTwitterUserTokenFromDB,
  // updateUserTokenWeb2ProfileInDB,
  initiateTwitterLoginDB,
  completeTwitterLoginDB,
} from '../services/twitter-user-token.service'
import type {
  TwitterUserTokenResponse,
  TwitterUserTokensQueryOptions,
} from '../types/twitter-user-token.types'

// Initiate login of user by generating DB entry containing request token and secret
export async function initiateTwitterLogin(req: Request, res: Response) {
  try {
    const twitterVerification = await initiateTwitterLoginDB()
    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while initiating twitter login', error)
    return handleError(res, error, 'Unable to initiate twitter login')
  }
}

// Complete login by verifying using data sent from twitter API
export async function completeTwitterLogin(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const twitterVerification = await completeTwitterLoginDB({
      requestToken: reqBody.requestToken,
      oAuthVerifier: reqBody.oAuthVerifier,
    })

    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while completing twitter verification', error)
    return handleError(res, error, 'Unable to complete twitter verification')
  }
}

// Update User Token Web2 data
// export async function updateTwitterUserToken(req: Request, res: Response) {
//   try {
//     const reqBody = req.body
//     const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

//     const userTokenRequest: Partial<IUserToken> = {
//       walletAddress: decodedAccount.walletAddress.toLowerCase(),
//       name: reqBody.name as string,
//       username: reqBody.username as string,
//       bio: reqBody.bio as string,
//       profilePhoto: reqBody.profilePhoto as string,
//     }
//     const updatedUserToken = await updateUserTokenWeb2ProfileInDB(
//       userTokenRequest
//     )

//     return handleSuccess(res, { userToken: updatedUserToken })
//   } catch (error) {
//     console.error(
//       'Error occurred while updating the user token web2 profile',
//       error
//     )
//     return handleError(
//       res,
//       error,
//       'Unable to update the user token web2 profile'
//     )
//   }
// }

// Fetch User Token
export async function fetchTwitterUserToken(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | TwitterUserTokenResponse
      | null
      | undefined
    const twitterUsername = req.query.twitterUsername
      ? (req.query.twitterUsername as string)
      : null
    const twitterUserTokenId = req.query.twitterUserTokenID
      ? (req.query.twitterUserTokenID as string)
      : (decodedAccount?.id as string)

    const twitterUserToken = await fetchTwitterUserTokenFromDB({
      twitterUserTokenId,
      twitterUsername,
    })

    return handleSuccess(res, { twitterUserToken })
  } catch (error) {
    console.error('Error occurred while fetching twitter user token', error)
    return handleError(res, error, 'Unable to fetch the twitter user token')
  }
}

export async function fetchAllTwitterUserTokens(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof TwitterUserTokenResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null
    const filterWallets =
      (req.query.filterWallets as string | undefined)?.split(',') ?? []

    const options: TwitterUserTokensQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      filterWallets,
    }

    const userTokens = await fetchAllTwitterUserTokensFromWeb2(options)
    return handleSuccess(res, { userTokens })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the ideamarket posts',
      error
    )
    return handleError(res, error, 'Unable to fetch the ideamarket posts')
  }
}

// export async function fetchUserRelations(req: Request, res: Response) {
//   try {
//     const decodedAccount = (req as any).decodedAccount as
//       | DECODED_ACCOUNT
//       | null
//       | undefined
//     const userTokenId = req.query.userTokenId
//       ? (req.query.userTokenId as string)
//       : null
//     const username = req.query.username ? (req.query.username as string) : null
//     const walletAddress = req.query.walletAddress
//       ? (req.query.walletAddress as string).toLowerCase()
//       : null
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof UserTokenResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'

//     const options: UserRelationsQueryOptions = {
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//     }

//     const relations = await fetchUserRelationsFromWeb2({
//       userTokenId: userTokenId ?? decodedAccount?.id ?? null,
//       username,
//       walletAddress,
//       options,
//     })

//     return handleSuccess(res, { relations })
//   } catch (error) {
//     console.error('Error occurred while fetching user relations', error)
//     return handleError(res, error, 'Unable to fetch the user relations')
//   }
// }

// export async function syncUserRelations(req: Request, res: Response) {
//   try {
//     const { walletAddress, ratedPostID, rating } = req.body

//     await syncUserRelationsForWallet({
//       walletAddress: walletAddress?.toLowerCase(),
//       ratedPostID,
//       rating,
//     })
//     return handleSuccess(res, {
//       message: `User relations has been updated for ${walletAddress as string}`,
//     })
//   } catch (error) {
//     console.error('Error occurred while syncing user relations', error)
//     return handleError(res, error, 'Unable to sync user relations')
//   }
// }

// export async function syncAllUserRelations(req: Request, res: Response) {
//   try {
//     await syncAllUserRelationsInDB()
//     return handleSuccess(res, {
//       message: `All user relations have been updated`,
//     })
//   } catch (error) {
//     console.error('Error occurred while syncing all user relations', error)
//     return handleError(res, error, 'Unable to sync all user relations')
//   }
// }
