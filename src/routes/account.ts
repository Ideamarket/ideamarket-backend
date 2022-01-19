/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  createAccount,
  fetchPublicAccountProfile,
  fetchAccount,
  updateAccount,
  uploadAccountProfilePhoto,
  authenticateAccount,
  checkAccountEmailVerificationCode,
  sendAccountEmailVerificationCode,
} from '../controllers/account.controller'
import {
  authenticate,
  authenticateAndSetAccount,
} from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  authenticateAccountValidation,
  checkAccountEmailVerificationCodeValidation,
  createAccountValidation,
  fetchPublicAccountProfileValidation,
  sendAccountEmailVerificationCodeValidation,
  updateAccountValidation,
} from '../validations/account.validation'

const accountRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Authenticate Account
accountRouter.post(
  '/authenticate',
  authenticateAccountValidation,
  validateRequest,
  authenticateAccount
)
// Create Account
accountRouter.post('', createAccountValidation, validateRequest, createAccount)

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
  authenticateAndSetAccount,
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
