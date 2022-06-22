/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fecthPostOpinionsByTokenId,
  fecthPostOpinionsByWallet,
  fetchAllPosts,
  fetchPost,
  fetchPostCitations,
  fetchPostCompositeRatings,
  syncAllCitedByPosts,
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
  fecthPostCitationsValidation,
} from '../validations/post.validation'

export const postRouter = express.Router()

postRouter.get('', fetchAllPostsValidation, validateRequest, fetchAllPosts)

postRouter.get('/single', fecthPostValidation, validateRequest, fetchPost)

postRouter.get(
  '/citations',
  fecthPostCitationsValidation,
  validateRequest,
  fetchPostCitations
)

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

postRouter.patch('/citedBy/sync', syncAllCitedByPosts)

postRouter.get(
  '/compositeRating',
  fetchPostCompositeRatingsValidation,
  validateRequest,
  fetchPostCompositeRatings
)
