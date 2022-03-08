/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  completeVerification,
  fetchTwitterProfile,
  generateAuthorizationUrl,
  initiateVerification,
} from '../controllers/twitterVerification.controller'
import { authenticateAndSetAccount } from '../middleware'
import { validateRequest } from '../middleware/validateRequest'
import {
  initiateVerificationValidation,
  fetchTwitterProfileValidation,
  generateAuthorizationUrlValidation,
  completeVerificationValidation,
} from '../validations/twitterVerification.validation'

export const twitterVerificationRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Fetch Twitter Profile
twitterVerificationRouter.get(
  '/profile/:username',
  fetchTwitterProfileValidation,
  validateRequest,
  fetchTwitterProfile
)

// Generate Twitter Authorization Url
twitterVerificationRouter.post(
  '/authorization',
  authenticateAndSetAccount,
  generateAuthorizationUrlValidation,
  validateRequest,
  generateAuthorizationUrl
)

// Initate Twitter Verification
twitterVerificationRouter.post(
  '/initiateVerification',
  authenticateAndSetAccount,
  initiateVerificationValidation,
  validateRequest,
  initiateVerification
)

// Complete Twitter Verification
twitterVerificationRouter.post(
  '/completeVerification',
  authenticateAndSetAccount,
  completeVerificationValidation,
  validateRequest,
  completeVerification
)
