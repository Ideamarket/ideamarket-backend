import express from 'express'

import {
  fetchUrlMetadata,
  fetchValidUrl,
} from '../controllers/general.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchUrlMetadataValidation,
  fetchValidUrlValidation,
} from '../validations/general.validation'

const generalRouter = express.Router()

generalRouter.post(
  '/url-metadata',
  fetchUrlMetadataValidation,
  validateRequest,
  fetchUrlMetadata
)

generalRouter.get(
  '/valid-url',
  fetchValidUrlValidation,
  validateRequest,
  fetchValidUrl
)

export { generalRouter }
