/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchAllComments,
  addComment,
} from '../controllers/comments.controller'
import { validateRequest } from '../middleware/validateRequest'
import { createCommentValidation } from '../validations/comments.validation'

const commentsRouter = express.Router()

commentsRouter.post('', createCommentValidation, validateRequest, addComment)
commentsRouter.get('', fetchAllComments)

export { commentsRouter }
