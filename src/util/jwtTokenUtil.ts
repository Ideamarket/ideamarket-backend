import config from 'config'
import jwt from 'jsonwebtoken'

import { AccountModel } from '../models/account.model'

const jwtSecretKey: string = config.get('jwt.secretKey')
const jwtExpiry: number = config.get('jwt.expiry')

export type PAYLOAD = {
  walletAddress: string
  exp: number
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
  const exp = Math.floor(Date.now() / 1000) + jwtExpiry

  try {
    const payload: PAYLOAD = { walletAddress, exp }
    authToken = jwt.sign(payload, jwtSecretKey, {
      algorithm: 'HS256',
    })
  } catch (error) {
    console.error('Error occurred while generating the auth token', error)
  }

  const validUntil = new Date(exp * 1000)
  return { authToken, validUntil }
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
 * Verifies the validity of the auth token and returns the account
 */
export async function verifyAuthTokenAndReturnAccount(
  token: string
): Promise<DECODED_ACCOUNT | null> {
  try {
    const walletAddress = decodeAuthToken(token)
    if (!walletAddress) {
      return null
    }

    const account = await AccountModel.findOne({ walletAddress })
    if (!account) {
      return null
    }

    return {
      id: account._id,
      username: account.username ?? null,
      walletAddress: account.walletAddress,
      role: account.role,
    }
  } catch (error) {
    console.error(
      'Error occurred while fetching account from auth token',
      error
    )
    return null
  }
}

export type DECODED_ACCOUNT = {
  id: string
  username: string | null
  walletAddress: string
  role: string
}
