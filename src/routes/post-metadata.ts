import express from 'express'

import {
  fetchPostMetadata,
  updatePostMetadata,
} from '../controllers/post-metadata.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchPostMetadataValidation,
  updatePostMetadataValidation,
} from '../validations/post-metadata.validation'

export const postMetadataRouter = express.Router()

postMetadataRouter.get(
  '/:tokenID',
  fetchPostMetadataValidation,
  validateRequest,
  fetchPostMetadata
)

postMetadataRouter.patch(
  '/update',
  updatePostMetadataValidation,
  validateRequest,
  updatePostMetadata
)
