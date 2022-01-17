/* eslint-disable no-useless-return */
/* eslint-disable sonarjs/no-redundant-jump */
import type { NextFunction, Request, Response } from 'express'

import { handleError } from '../lib/base'
import { UnAuthenticatedError } from '../services/errors'
import {
  verifyAuthToken,
  verifyAuthTokenAndReturnAccount,
} from '../util/jwtTokenUtil'

const AUTHORIZATION_HEADER_MISSING_ERR_LOG =
  'Authentication failed! authorization header is missing'
const INVALID_AUTH_TOKEN_ERR_LOG = 'Authentication failed! Invalid auth token'
const AUTHENTICATION_FAILED_ERR_MSG =
  'Authentication failed! Request cannot be processed further'
const AUTHENTICATION_SUCCESS_LOG = 'Authentication is successful'

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authorizationHeader = req.headers.authorization as string
  if (!authorizationHeader) {
    console.error(AUTHORIZATION_HEADER_MISSING_ERR_LOG)
    return handleError(
      res,
      new UnAuthenticatedError(),
      AUTHENTICATION_FAILED_ERR_MSG
    )
  }
  const [, authToken] = authorizationHeader.split(' ')
  const isAuthTokenValid = verifyAuthToken(authToken)
  if (!isAuthTokenValid) {
    console.error(INVALID_AUTH_TOKEN_ERR_LOG)
    return handleError(
      res,
      new UnAuthenticatedError(),
      AUTHENTICATION_FAILED_ERR_MSG
    )
  }
  console.info(AUTHENTICATION_SUCCESS_LOG)
  next()
  return
}

export async function authenticateAndSetAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader = req.headers.authorization as string
  if (!authorizationHeader) {
    console.error(AUTHORIZATION_HEADER_MISSING_ERR_LOG)
    return handleError(
      res,
      new UnAuthenticatedError(),
      AUTHENTICATION_FAILED_ERR_MSG
    )
  }
  const [, authToken] = authorizationHeader.split(' ')
  const decodedAccount = await verifyAuthTokenAndReturnAccount(authToken)
  console.info(`Account : ${JSON.stringify(decodedAccount)}`)
  if (!decodedAccount) {
    console.error(INVALID_AUTH_TOKEN_ERR_LOG)
    return handleError(
      res,
      new UnAuthenticatedError(),
      AUTHENTICATION_FAILED_ERR_MSG
    )
  }
  console.info(AUTHENTICATION_SUCCESS_LOG)
  ;(req as any).decodedAccount = decodedAccount
  next()
  return
}