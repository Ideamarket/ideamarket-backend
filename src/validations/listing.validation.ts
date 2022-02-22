import { body, oneOf, query } from 'express-validator'

import { isMarketIdValid } from '../util/marketUtil'

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
  oneOf(
    [
      query('listingId').notEmpty().isString(),
      [
        query('marketId').notEmpty().isString().custom(isMarketIdValid),
        query('value').notEmpty().isString(),
        query('onchainValue').notEmpty().isString(),
      ],
    ],
    'Atleast one of listingId (or) [marketId, value, onchainValue] are mandatory'
  ),
]

export const addGhostListingValidation = [
  body('marketId')
    .notEmpty()
    .isInt()
    .custom(isMarketIdValid)
    .withMessage('marketId is invalid'),
  body('value').notEmpty().withMessage('Token value cannot be empty'),
  body('categories')
    .optional()
    .isString()
    .withMessage('categories is not valid'),
]

export const addOnchainListingValidation = [
  body('marketId')
    .notEmpty()
    .isInt()
    .custom(isMarketIdValid)
    .withMessage('marketId is invalid'),
  body('value').notEmpty().withMessage('Token value cannot be empty'),
  body('onchainValue')
    .notEmpty()
    .withMessage('Onchain token value cannot be empty'),
]

export const addCategoryValidation = [
  body('listingId')
    .notEmpty()
    .withMessage('listingId cannot be empty/null')
    .isString()
    .withMessage('listingId is invalid'),
  body('categoryId')
    .notEmpty()
    .withMessage('categoryId cannot be empty/null')
    .isString()
    .withMessage('categoryId is invalid'),
]

export const removeCategoryValidation = [
  body('listingId')
    .notEmpty()
    .withMessage('listingId cannot be empty/null')
    .isString()
    .withMessage('listingId is invalid'),
  body('categoryId')
    .notEmpty()
    .withMessage('categoryId cannot be empty/null')
    .isString()
    .withMessage('categoryId is invalid'),
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
