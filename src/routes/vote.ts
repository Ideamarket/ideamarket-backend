/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  downvote,
  upvote,
  fetchVoteCount,
} from '../controllers/vote.controller'
import { authenticateAndSetUser } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import { voteValidation } from '../validations/votes.validation'

const votesRouter = express.Router()

votesRouter.get('/:market/:listing', fetchVoteCount)
votesRouter.post(
  '/up',
  authenticateAndSetUser,
  voteValidation,
  validateRequest,
  upvote
)
votesRouter.post(
  '/down',
  authenticateAndSetUser,
  voteValidation,
  validateRequest,
  downvote
)

export { votesRouter }
