import express from 'express'

import {
  fetchLatestApr,
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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
generalRouter.get('/apr', fetchLatestApr)

export { generalRouter }
