/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  checkUserTokenEmailVerificationCode,
  createUser,
  fetchAllUserTokens,
  fetchUserHolders,
  fetchUserHoldings,
  fetchUserToken,
  sendUserTokenEmailVerificationCode,
  signInUser,
  syncAccountsToUserTokens,
  syncUserTokens,
  updateUserToken,
  uploadUserTokenProfilePhoto,
} from '../controllers/user-token.controller'
import {
  authenticate,
  authenticateAndSetAccount,
  optionalAuthenticateAndSetAccount,
} from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  checkUserTokenEmailVerificationCodeValidation,
  createUserValidation,
  fetchAllUserTokensValidation,
  fetchUserHoldersValidation,
  fetchUserHoldingsValidation,
  fetchUserTokenValidation,
  sendUserTokenEmailVerificationCodeValidation,
  signInUserValidation,
  syncAllUserTokensValidation,
  updateuserTokenValidation,
} from '../validations/user-token.validation'

export const userTokenRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Copy Accounts to UserTokens
userTokenRouter.patch('/copyAccounts', syncAccountsToUserTokens)

// Create User
userTokenRouter.post('', createUserValidation, validateRequest, createUser)

// SignIn User
userTokenRouter.post(
  '/signIn',
  signInUserValidation,
  validateRequest,
  signInUser
)

// Update User Account
userTokenRouter.patch(
  '',
  authenticateAndSetAccount,
  updateuserTokenValidation,
  validateRequest,
  updateUserToken
)

// Fetch Single User Token
userTokenRouter.get(
  '/single',
  fetchUserTokenValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchUserToken
)

// Upload Profile Photo
userTokenRouter.post('/profilePhoto', authenticate, uploadUserTokenProfilePhoto)

// Send Email Verification Code
userTokenRouter.get(
  '/emailVerification',
  sendUserTokenEmailVerificationCodeValidation,
  validateRequest,
  sendUserTokenEmailVerificationCode
)

// Email Verification
userTokenRouter.post(
  '/emailVerification',
  authenticateAndSetAccount,
  checkUserTokenEmailVerificationCodeValidation,
  validateRequest,
  checkUserTokenEmailVerificationCode
)

// Fetch all user tokens from web2
userTokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  fetchAllUserTokens
)

// Fetch All User Holders
userTokenRouter.get(
  '/holders',
  fetchUserHoldersValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchUserHolders
)

// Fetch All User Holdings
userTokenRouter.get(
  '/holdings',
  fetchUserHoldingsValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchUserHoldings
)

// Sync UserTokens from web3 to web2
userTokenRouter.patch(
  '/sync',
  syncAllUserTokensValidation,
  validateRequest,
  syncUserTokens
)
