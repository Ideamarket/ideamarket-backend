/* eslint-disable @typescript-eslint/no-misused-promises */

import express from 'express'

import {
  fetchAllByMarket,
  addGhostListing,
  addOnChainListing,
  migrateGhostListingToOnChain,
} from '../controllers/listing.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createGhostListingValidation,
  createOnchainListingValidation,
  marketTypeParamValidation,
  migrateGhostListingValidation,
} from '../validations/listing.validation'

const listingRouter = express.Router()

listingRouter.get(
  '/:marketType',
  marketTypeParamValidation,
  validateRequest,
  fetchAllByMarket
)
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
