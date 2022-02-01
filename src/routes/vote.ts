/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  downVote,
  upVote,
  fetchVoteCount,
  deleteUpVote,
  deleteDownVote,
} from '../controllers/vote.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  downVoteValidation,
  fetchVoteCountValidation,
  upVoteValidation,
} from '../validations/votes.validation'

const votesRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Fetch Vote Count
votesRouter.get('', fetchVoteCountValidation, validateRequest, fetchVoteCount)

// UpVote a listing
votesRouter.post(
  '/up',
  authenticateAndSetAccount,
  upVoteValidation,
  validateRequest,
  upVote
)

// Delete upVote of a listing
votesRouter.delete(
  '/up',
  authenticateAndSetAccount,
  upVoteValidation,
  validateRequest,
  deleteUpVote
)

// DownVote a listing
votesRouter.post(
  '/down',
  authenticateAndSetAccount,
  downVoteValidation,
  validateRequest,
  downVote
)

// Delete downVote of a listing
votesRouter.delete(
  '/down',
  authenticateAndSetAccount,
  downVoteValidation,
  validateRequest,
  deleteDownVote
)

export { votesRouter }
