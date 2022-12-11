import express from 'express'

import {
  // fetchPostOpinionsByTokenId,
  // fetchPostOpinionsByWallet,
  fetchAllTwitterPosts,
  // fetchCitedByPosts,
  fetchTwitterPost,
  // fetchPostCitations,
  // fetchPostCompositeRatings,
  updateTwitterPost,
} from '../controllers/twitter-post.controller'
import { authenticateAndSetAccount } from '../middleware/twitterAuthentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllTwitterPostsValidation,
  // fetchPostOpinionsByTokenIdValidation,
  // fetchPostOpinionsByWalletValidation,
  fetchTwitterPostValidation,
  // fetchPostCompositeRatingsValidation,
  // fetchPostCitationsValidation,
  // fetchCitedByPostsValidation,
} from '../validations/twitter-post.validation'

export const twitterPostRouter = express.Router()

twitterPostRouter.get(
  '',
  fetchAllTwitterPostsValidation,
  validateRequest,
  fetchAllTwitterPosts
)

twitterPostRouter.get(
  '/single',
  fetchTwitterPostValidation,
  validateRequest,
  fetchTwitterPost
)

twitterPostRouter.patch(
  '/update',
  // updatePostMetadataValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateTwitterPost
)

// twitterPostRouter.get(
//   '/citations',
//   fecthPostCitationsValidation,
//   validateRequest,
//   fetchPostCitations
// )

// twitterPostRouter.get(
//   '/citedBy',
//   fecthCitedByPostsValidation,
//   validateRequest,
//   fetchCitedByPosts
// )

// twitterPostRouter.get(
//   '/opinions/token',
//   fecthPostOpinionsByTokenIdValidation,
//   validateRequest,
//   fecthPostOpinionsByTokenId
// )

// twitterPostRouter.get(
//   '/opinions/wallet',
//   fecthPostOpinionsByWalletValidation,
//   validateRequest,
//   fecthPostOpinionsByWallet
// )

// twitterPostRouter.get(
//   '/compositeRating',
//   fetchPostCompositeRatingsValidation,
//   validateRequest,
//   fetchPostCompositeRatings
// )
