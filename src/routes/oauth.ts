/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchTwitterAccessToken,
  fetchTwitterRequestToken,
  postTweet,
} from '../controllers/oauth.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchTwitterAccessTokenValidation,
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
  optionalAuthenticateAndSetAccount,
  postTweetValidation,
  validateRequest,
  postTweet
)
