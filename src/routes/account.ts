/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchPublicAccountProfile,
  fetchAccount,
  updateAccount,
  uploadAccountProfilePhoto,
  checkAccountEmailVerificationCode,
  sendAccountEmailVerificationCode,
  linkAccount,
  signInAccount,
} from '../controllers/account.controller'
import {
  authenticate,
  authenticateAndSetAccount,
} from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  checkAccountEmailVerificationCodeValidation,
  fetchPublicAccountProfileValidation,
  linkAccountValidation,
  sendAccountEmailVerificationCodeValidation,
  signInAccountValidation,
  updateAccountValidation,
} from '../validations/account.validation'

const accountRouter = express.Router()

// -------------------- ROUTES -------------------- //

// SignIn Account
accountRouter.post(
  '/signIn',
  signInAccountValidation,
  validateRequest,
  signInAccount
)

// Link Account
accountRouter.post(
  '/link',
  authenticateAndSetAccount,
  linkAccountValidation,
  validateRequest,
  linkAccount
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
