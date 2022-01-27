import { body, param } from 'express-validator'

export const marketTypeParamValidation = [
  param('marketType').notEmpty().isIn(['ghost', 'onchain']),
]

export const createGhostListingValidation = [
  body('marketId')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Invalid market provided for listing'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]

export const createOnchainListingValidation = [
  body('marketId')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Invalid market provided for listing'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
  body('onchainId').notEmpty().withMessage('onchainId is required'),
  body('listedAt').notEmpty().withMessage('listedAt is required'),
]

export const migrateGhostListingValidation = [
  body('listingId').notEmpty().withMessage('listingId is required'),
  body('onchainId').notEmpty().withMessage('onchainId is required'),
  body('listedAt').notEmpty().withMessage('listedAt is required'),
]
