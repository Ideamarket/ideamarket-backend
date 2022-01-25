/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import { fetchAllByMarket, addListing } from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import { createListingValidation } from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get('/:marketType', fetchAllByMarket)
listingRouter.post(
  '/:marketType',
  authenticateAndSetAccount,
  createListingValidation,
  validateRequest,
  addListing
)

export { listingRouter }
