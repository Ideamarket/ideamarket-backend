import express from 'express'

import {
  createTwitterOpinion,
  fetchAllTwitterOpinions,
  fetchTwitterOpinion,
} from '../controllers/twitter-opinion.controller'
import { authenticateAndSetAccount } from '../middleware/twitterAuthentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createTwitterOpinionValidation,
  fetchTwitterOpinionsValidation,
  fetchTwitterOpinionValidation,
} from '../validations/twitter-opinion.validation'

export const twitterOpinionRouter = express.Router()

twitterOpinionRouter.post(
  '',
  createTwitterOpinionValidation,
  validateRequest,
  authenticateAndSetAccount,
  createTwitterOpinion
)

twitterOpinionRouter.get(
  '',
  fetchTwitterOpinionsValidation,
  validateRequest,
  fetchAllTwitterOpinions
)

twitterOpinionRouter.get(
  '/single',
  fetchTwitterOpinionValidation,
  validateRequest,
  fetchTwitterOpinion
)
