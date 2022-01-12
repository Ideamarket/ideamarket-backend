/* eslint-disable no-useless-return */
/* eslint-disable sonarjs/no-redundant-jump */
import type { Request, Response } from 'express'

import { handleError } from '../lib/base'
import { UserRole } from '../models/user-accounts.model'
import {
  PermissionAccessViolationError,
  UnAuthenticatedError,
} from '../services/errors'
import type { DECODED_USER } from '../util/jwtTokenUtil'

const REQUEST_NOT_AUTHENTICATED = 'Request is not yet authenticated'
const REQUEST_UNAUTHORIZED_LOG = 'User is not permitted to perform this action'
const REQUEST_UNAUTHORIZED_MESSAGE =
  'You are not permitted to perform this action'

export async function authorizeModerator(
  req: Request,
  res: Response,
  next: () => void
) {
  const decodedUser = (req as any).user
  if (!decodedUser) {
    console.error(REQUEST_NOT_AUTHENTICATED)
    return handleError(
      res,
      new UnAuthenticatedError(),
      REQUEST_NOT_AUTHENTICATED
    )
  }
  const userRole = (decodedUser as DECODED_USER).role
  if (userRole !== UserRole.MODERATOR) {
    console.error(REQUEST_UNAUTHORIZED_LOG)
    return handleError(
      res,
      new PermissionAccessViolationError(),
      REQUEST_UNAUTHORIZED_MESSAGE
    )
  }
  next()
  return
}

export async function authorizeAdmin(
  req: Request,
  res: Response,
  next: () => void
) {
  const decodedUser = (req as any).user
  if (!decodedUser) {
    console.error(REQUEST_NOT_AUTHENTICATED)
    return handleError(
      res,
      new UnAuthenticatedError(),
      REQUEST_NOT_AUTHENTICATED
    )
  }
  const userRole = (decodedUser as DECODED_USER).role
  if (userRole !== UserRole.ADMIN) {
    console.error(REQUEST_UNAUTHORIZED_LOG)
    return handleError(
      res,
      new PermissionAccessViolationError(),
      REQUEST_UNAUTHORIZED_MESSAGE
    )
  }
  next()
  return
}

export async function authorizeModeratorOrAdmin(
  req: Request,
  res: Response,
  next: () => void
) {
  const decodedUser = (req as any).user
  if (!decodedUser) {
    console.error(REQUEST_NOT_AUTHENTICATED)
    return handleError(
      res,
      new UnAuthenticatedError(),
      REQUEST_NOT_AUTHENTICATED
    )
  }
  const userRole = (decodedUser as DECODED_USER).role
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.MODERATOR) {
    console.error(REQUEST_UNAUTHORIZED_LOG)
    return handleError(
      res,
      new PermissionAccessViolationError(),
      REQUEST_UNAUTHORIZED_MESSAGE
    )
  }
  next()
  return
}
