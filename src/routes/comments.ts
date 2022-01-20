/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchAllComments,
  addComment,
  deleteCommentById,
  updateComment,
} from '../controllers/comments.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createCommentValidation,
  updateCommentValidation,
} from '../validations/comments.validation'

const commentsRouter = express.Router()

commentsRouter.post(
  '',
  authenticateAndSetAccount,
  createCommentValidation,
  validateRequest,
  addComment
)
commentsRouter.get('', fetchAllComments)
commentsRouter.put(
  '/:id',
  authenticateAndSetAccount,
  updateCommentValidation,
  validateRequest,
  updateComment
)
commentsRouter.delete('/:id', authenticateAndSetAccount, deleteCommentById)

export { commentsRouter }
