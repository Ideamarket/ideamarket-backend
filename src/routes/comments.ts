/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchAllComments,
  addComment,
  deleteCommentById,
  updateComment
} from '../controllers/comments.controller'
import { validateRequest } from '../middleware/validateRequest'
import { createCommentValidation, updateCommentValidation } from '../validations/comments.validation'

const commentsRouter = express.Router()

commentsRouter.post('', createCommentValidation, validateRequest, addComment)
commentsRouter.get('', fetchAllComments)
commentsRouter.put("/:id", updateCommentValidation,validateRequest, updateComment);
commentsRouter.delete('/:id', deleteCommentById)

export { commentsRouter }
