/* eslint-disable sonarjs/no-duplicate-string */
import { body, oneOf, query } from 'express-validator'

import { isMarketIdValid } from '../util'

export const fetchListingsValidation = [
  query('marketType')
    .optional({ nullable: true })
    .isIn(['ghost', 'onchain'])
    .withMessage('Market type is not valid'),
  query('marketIds').notEmpty().withMessage('MarketIds cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchListingValidation = [
  query('marketId')
    .notEmpty()
    .isString()
    .custom(isMarketIdValid)
    .withMessage('marketId is invalid'),
  query('value').notEmpty().withMessage('Token value cannot be empty'),
]

export const addGhostListingValidation = [
  body('marketId')
    .notEmpty()
    .isInt()
    .custom(isMarketIdValid)
    .withMessage('marketId is invalid'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]

export const addOnChainListingValidation = [
  body('marketId')
    .notEmpty()
    .isInt()
    .custom(isMarketIdValid)
    .withMessage('marketId is invalid'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]

export const addListingToBlacklistValidation = [
  oneOf(
    [
      body('listingId').notEmpty().isString(),
      body('onchainId').notEmpty().isString(),
    ],
    'Atleast one of listingId and onchainId is mandatory'
  ),
]

export const removeListingFromBlacklistValidation = [
  body('listingId').notEmpty().isString().withMessage('ListingId is required'),
]
