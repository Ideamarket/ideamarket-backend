/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  completeVerification,
  initiateVerification,
  updateTwitterVerifiedListings,
} from '../controllers/twitterVerification.controller'
import { authenticateAndSetAccount } from '../middleware'
import { validateRequest } from '../middleware/validateRequest'
import { completeVerificationValidation } from '../validations/twitterVerification.validation'

export const twitterVerificationRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Initate Twitter Verification
twitterVerificationRouter.post(
  '/initiateVerification',
  authenticateAndSetAccount,
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

// Update Old Twitter Verified Listings
twitterVerificationRouter.patch(
  '/twitterVerifiedListings',
  updateTwitterVerifiedListings
)
