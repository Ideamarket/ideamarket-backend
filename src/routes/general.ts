/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchETHPrice,
  fetchLatestApr,
  fetchLatestLPApr,
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

generalRouter.get('/apr', fetchLatestApr)

generalRouter.get('/lp-apr', fetchLatestLPApr)

generalRouter.get('/eth-price', fetchETHPrice)

export { generalRouter }
