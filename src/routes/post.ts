import express from 'express'

import {
  fecthPostOpinionsByTokenId,
  fecthPostOpinionsByWallet,
  fetchAllPosts,
  fetchPost,
  fetchPostCompositeRatings,
  syncAllPosts,
} from '../controllers/post.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllPostsValidation,
  fecthPostOpinionsByTokenIdValidation,
  syncAllPostsValidation,
  fecthPostOpinionsByWalletValidation,
  fecthPostValidation,
  fetchPostCompositeRatingsValidation,
} from '../validations/post.validation'

export const postRouter = express.Router()

postRouter.get('', fetchAllPostsValidation, validateRequest, fetchAllPosts)

postRouter.get('/single', fecthPostValidation, validateRequest, fetchPost)

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

postRouter.get(
  '/compositeRating',
  fetchPostCompositeRatingsValidation,
  validateRequest,
  fetchPostCompositeRatings
)
