/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  downvote,
  upvote,
  fetchVoteCount,
} from '../controllers/vote.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import { voteValidation } from '../validations/votes.validation'

const votesRouter = express.Router()

votesRouter.get('/:market/:listing', fetchVoteCount)
votesRouter.post(
  '/up',
  authenticateAndSetAccount,
  voteValidation,
  validateRequest,
  upvote
)
votesRouter.post(
  '/down',
  authenticateAndSetAccount,
  voteValidation,
  validateRequest,
  downvote
)

export { votesRouter }
