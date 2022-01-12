import config from 'config'
import jwt from 'jsonwebtoken'

import { UserAccountModel } from '../models/user-accounts.model'

const jwtSecretKey: string = config.get('jwt.secretKey')
const jwtExpiry: number = config.get('jwt.expiry')

export type PAYLOAD = {
  walletAddress: string
}

type DECODED_PAYLOAD = {
  walletAddress: string
  iat: number
  exp: number
}

/**
 * Generates the auth token with wallet address in the payload
 */
export function generateAuthToken(walletAddress: string) {
  let authToken = null
  const expiresIn = 0
  try {
    const payload: PAYLOAD = { walletAddress }
    authToken = jwt.sign(payload, jwtSecretKey, {
      algorithm: 'HS256',
      expiresIn: jwtExpiry,
    })
  } catch (error) {
    console.error('Error occurred while generating the auth token', error)
  }
  return { authToken, expiresIn }
}

/**
 * Verifies whether the auth token is valid or not
 */
export function verifyAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return !!decodedPayload.walletAddress
  } catch (error) {
    console.error('Error occurred while verifying the auth token', error)
    return false
  }
}

/**
 * Decodes the auth token if auth token is valid
 */
function decodeAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return decodedPayload.walletAddress
  } catch (error) {
    console.error('Error occurred while decoding the auth token', error)
    return null
  }
}

/**
 * Verifies the validity of the auth token and returns the user
 */
export async function verifyAuthTokenAndReturnUser(
  token: string
): Promise<DECODED_USER | null> {
  try {
    const walletAddress = decodeAuthToken(token)
    if (!walletAddress) {
      return null
    }

    const userAccount = await UserAccountModel.findOne({ walletAddress })
    if (!userAccount) {
      return null
    }

    return {
      id: userAccount._id,
      username: userAccount.username ?? null,
      walletAddress: userAccount.walletAddress,
      role: userAccount.role,
    }
  } catch (error) {
    console.error('Error occurred while fetching user from auth token', error)
    return null
  }
}

export type DECODED_USER = {
  id: bigint
  username: string | null
  walletAddress: string
  role: string
}
