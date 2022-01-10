/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

// eslint-disable-next-line import/order
import { voteValidation } from '../validations/votes.validation'
import {
  downvote,
  upvote,
  fetchVoteCount,
} from '../controllers/vote.controller'
import { validateRequest } from '../middleware/validateRequest'

const votesRouter = express.Router()

votesRouter.get('/:market/:listing', fetchVoteCount)
votesRouter.post('/up', voteValidation, validateRequest, upvote)
votesRouter.post('/down', voteValidation, validateRequest, downvote)

export { votesRouter }
