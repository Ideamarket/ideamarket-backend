import { body, query } from 'express-validator'

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

export const addGhostListingValidation = [
  body('marketId')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Invalid marketId provided for listing'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]

export const addOnChainListingValidation = [
  body('marketId')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Invalid marketId provided for listing'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]
