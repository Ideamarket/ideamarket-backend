/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  addCategory,
  addGhostListing,
  addListingToBlacklist,
  addOnchainListing,
  fetchBlacklistedListings,
  fetchListing,
  fetchListings,
  removeCategory,
  removeListingFromBlacklist,
  updateOnchainListings,
} from '../controllers/listing.controller'
import {
  authenticateAndSetAccount,
  optionalAuthenticateAndSetAccount,
} from '../middleware/authentication'
import { authorizeModeratorOrAdmin } from '../middleware/authorization'
import { validateRequest } from '../middleware/validateRequest'
import {
  addListingToBlacklistValidation,
  addGhostListingValidation,
  addOnchainListingValidation,
  removeListingFromBlacklistValidation,
  fetchListingsValidation,
  fetchListingValidation,
  addCategoryValidation,
  removeCategoryValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get(
  '',
  optionalAuthenticateAndSetAccount,
  fetchListingsValidation,
  validateRequest,
  fetchListings
)

listingRouter.get(
  '/single',
  optionalAuthenticateAndSetAccount,
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
  optionalAuthenticateAndSetAccount,
  addOnchainListingValidation,
  validateRequest,
  addOnchainListing
)

listingRouter.patch('/onchain', updateOnchainListings)

listingRouter.post(
  '/category',
  authenticateAndSetAccount,
  authorizeModeratorOrAdmin,
  addCategoryValidation,
  validateRequest,
  addCategory
)

listingRouter.delete(
  '/category',
  authenticateAndSetAccount,
  authorizeModeratorOrAdmin,
  removeCategoryValidation,
  validateRequest,
  removeCategory
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
