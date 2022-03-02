/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchTwitterAccessToken,
  fetchTwitterProfile,
  fetchTwitterRequestToken,
  postTweet,
} from '../controllers/oauth.controller'
import {
  authenticateAndSetAccount,
  optionalAuthenticateAndSetAccount,
} from '../middleware'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchTwitterAccessTokenValidation,
  fetchTwitterProfileValidation,
  fetchTwitterRequestTokenValidation,
  postTweetValidation,
} from '../validations/oauth.validation'

export const oauthRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Twitter OAuth - Request Token
oauthRouter.post(
  '/twitter/requestToken',
  optionalAuthenticateAndSetAccount,
  fetchTwitterRequestTokenValidation,
  validateRequest,
  fetchTwitterRequestToken
)

// Twitter OAuth - Access Token
oauthRouter.post(
  '/twitter/accessToken',
  optionalAuthenticateAndSetAccount,
  fetchTwitterAccessTokenValidation,
  validateRequest,
  fetchTwitterAccessToken
)

// Twitter OAuth - Post Tweet
oauthRouter.post(
  '/twitter/tweet',
  authenticateAndSetAccount,
  postTweetValidation,
  validateRequest,
  postTweet
)

// Fetch Twitter Profile
oauthRouter.get(
  '/twitter/:username',
  fetchTwitterProfileValidation,
  validateRequest,
  fetchTwitterProfile
)
