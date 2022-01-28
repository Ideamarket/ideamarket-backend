/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  addGhostListing,
  addOnChainListing,
  fetchListings,
} from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  addGhostListingValidation,
  addOnChainListingValidation,
  fetchListingsValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get('', fetchListingsValidation, validateRequest, fetchListings)
listingRouter.post(
  '/ghost',
  authenticateAndSetAccount,
  addGhostListingValidation,
  validateRequest,
  addGhostListing
)

listingRouter.post(
  '/onchain',
  authenticateAndSetAccount,
  addOnChainListingValidation,
  validateRequest,
  addOnChainListing
)

export { listingRouter }
