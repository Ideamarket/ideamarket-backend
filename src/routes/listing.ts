/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  fetchAllByMarket,
  addGhostListing,
} from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createListingValidation,
  marketTypeParamValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get(
  '/:marketType',
  marketTypeParamValidation,
  validateRequest,
  fetchAllByMarket
)
listingRouter.post(
  '/:marketType',
  authenticateAndSetAccount,
  createListingValidation,
  validateRequest,
  addGhostListing
)

export { listingRouter }
