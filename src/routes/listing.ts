/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  addGhostListing,
  addOnChainListing,
  migrateGhostListingToOnChain,
  fetchListings,
} from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createGhostListingValidation,
  createOnchainListingValidation,
  fetchListingsValidation,
  migrateGhostListingValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get('', fetchListingsValidation, validateRequest, fetchListings)
listingRouter.post(
  '/ghost',
  authenticateAndSetAccount,
  createGhostListingValidation,
  validateRequest,
  addGhostListing
)

listingRouter.post(
  '/onchain',
  authenticateAndSetAccount,
  createOnchainListingValidation,
  validateRequest,
  addOnChainListing
)

listingRouter.post(
  '/onchain/migrate',
  authenticateAndSetAccount,
  migrateGhostListingValidation,
  validateRequest,
  migrateGhostListingToOnChain
)

export { listingRouter }
