import express from 'express'

import {
  completeTwitterLogin,
  fetchAllTwitterUserTokens,
  fetchTwitterUserToken,
  initiateTwitterLogin,
} from '../controllers/twitter-user-token.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/twitterAuthentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  completeTwitterLoginValidation,
  fetchAllTwitterUserTokensValidation,
  fetchTwitterUserTokenValidation,
} from '../validations/twitter-user-token.validation'

export const twitterUserTokenRouter = express.Router()

twitterUserTokenRouter.post(
  '/initiateTwitterLogin',
  validateRequest,
  initiateTwitterLogin
)

twitterUserTokenRouter.post(
  '/completeTwitterLogin',
  completeTwitterLoginValidation,
  validateRequest,
  completeTwitterLogin
)

twitterUserTokenRouter.get(
  '/single',
  fetchTwitterUserTokenValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchTwitterUserToken
)

twitterUserTokenRouter.get(
  '',
  fetchAllTwitterUserTokensValidation,
  validateRequest,
  fetchAllTwitterUserTokens
)
