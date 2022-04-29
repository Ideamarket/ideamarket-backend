/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fecthPostOpinionsByTokenId,
  fecthPostOpinionsByWallet,
  fetchAllPosts,
  fetchPost,
  syncAllPosts,
} from '../controllers/post.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllPostsValidation,
  fecthPostOpinionsByTokenIdValidation,
  syncAllPostsValidation,
  fecthPostOpinionsByWalletValidation,
} from '../validations/post.validation'

export const postRouter = express.Router()

postRouter.get('', fetchAllPostsValidation, validateRequest, fetchAllPosts)

postRouter.get('/:tokenID', fetchPost)

postRouter.get(
  '/opinions/token',
  fecthPostOpinionsByTokenIdValidation,
  validateRequest,
  fecthPostOpinionsByTokenId
)

postRouter.get(
  '/opinions/wallet',
  fecthPostOpinionsByWalletValidation,
  validateRequest,
  fecthPostOpinionsByWallet
)

postRouter.patch('/sync', syncAllPostsValidation, validateRequest, syncAllPosts)
