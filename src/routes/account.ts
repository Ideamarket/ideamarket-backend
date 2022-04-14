/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchPublicAccountProfile,
  fetchAccount,
  updateAccount,
  uploadAccountProfilePhoto,
  checkAccountEmailVerificationCode,
  sendAccountEmailVerificationCode,
  signInAccount,
  removeAllUsernames,
} from '../controllers/account.controller'
import { authorizeAdmin } from '../middleware'
import {
  authenticate,
  authenticateAndSetAccount,
} from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  checkAccountEmailVerificationCodeValidation,
  fetchPublicAccountProfileValidation,
  removeAllUsernamesValidation,
  sendAccountEmailVerificationCodeValidation,
  signInAccountValidation,
  updateAccountValidation,
} from '../validations/account.validation'

const accountRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Remove All Usernames
accountRouter.post(
  '/removeUsernames',
  authenticateAndSetAccount,
  authorizeAdmin,
  removeAllUsernamesValidation,
  validateRequest,
  removeAllUsernames
)

// SignIn Account
accountRouter.post(
  '/signIn',
  signInAccountValidation,
  validateRequest,
  signInAccount
)

// Update Account
accountRouter.patch(
  '',
  authenticateAndSetAccount,
  updateAccountValidation,
  validateRequest,
  updateAccount
)

// Fetch Account
accountRouter.get('', authenticateAndSetAccount, fetchAccount)

// Fetch Public Account Profile
accountRouter.get(
  '/publicProfile',
  fetchPublicAccountProfileValidation,
  validateRequest,
  fetchPublicAccountProfile
)

// Upload Profile Photo
accountRouter.post('/profilePhoto', authenticate, uploadAccountProfilePhoto)

// Send Email Verification Code
accountRouter.get(
  '/emailVerification',
  sendAccountEmailVerificationCodeValidation,
  validateRequest,
  sendAccountEmailVerificationCode
)

// Email Verification
accountRouter.post(
  '/emailVerification',
  authenticateAndSetAccount,
  checkAccountEmailVerificationCodeValidation,
  validateRequest,
  checkAccountEmailVerificationCode
)

export { accountRouter }
