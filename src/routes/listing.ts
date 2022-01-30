/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  addGhostListing,
  addListingToBlacklist,
  addOnChainListing,
  fetchBlacklistedListings,
  fetchListing,
  fetchListings,
  removeListingFromBlacklist,
} from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { authorizeModeratorOrAdmin } from '../middleware/authorization'
import { validateRequest } from '../middleware/validateRequest'
import {
  addListingToBlacklistValidation,
  addGhostListingValidation,
  addOnChainListingValidation,
  removeListingFromBlacklistValidation,
  fetchListingsValidation,
  fetchListingValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get('', fetchListingsValidation, validateRequest, fetchListings)

listingRouter.get(
  '/single',
  fetchListingValidation,
  validateRequest,
  fetchListing
)

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

listingRouter.post(
  '/blacklist',
  authenticateAndSetAccount,
  authorizeModeratorOrAdmin,
  addListingToBlacklistValidation,
  validateRequest,
  addListingToBlacklist
)

listingRouter.get('/blacklist', fetchBlacklistedListings)

listingRouter.delete(
  '/blacklist',
  authenticateAndSetAccount,
  authorizeModeratorOrAdmin,
  removeListingFromBlacklistValidation,
  validateRequest,
  removeListingFromBlacklist
)

export { listingRouter }
