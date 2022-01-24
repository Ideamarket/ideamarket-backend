/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  downvote,
  upvote,
  fetchVoteCount,
} from '../controllers/vote.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  marketTypeParamValidation,
  voteValidation,
} from '../validations/votes.validation'

const votesRouter = express.Router()

votesRouter.get(
  '/:marketType/:market/:listing',
  marketTypeParamValidation,
  fetchVoteCount,
  validateRequest
)
votesRouter.post(
  '/:marketType/up',
  authenticateAndSetAccount,
  voteValidation,
  validateRequest,
  upvote
)
votesRouter.post(
  '/:marketType/down',
  authenticateAndSetAccount,
  voteValidation,
  validateRequest,
  downvote
)

export { votesRouter }
