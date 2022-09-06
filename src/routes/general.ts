/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchETHPrice,
  fetchLatestApr,
  fetchLatestLPApr,
  fetchUrlMetadata,
  fetchValidUrl,
} from '../controllers/general.controller'
import { cacheThisRoute } from '../middleware/cache'
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

generalRouter.get('/apr', fetchLatestApr)

generalRouter.get('/lp-apr', fetchLatestLPApr)

// Cache for this route expires in 1 hour. Then, ETH price is updated
generalRouter.get('/eth-price', cacheThisRoute(3600), fetchETHPrice)

export { generalRouter }
