import { body } from 'express-validator'

export const createListingValidation = [
  body('marketId')
    .notEmpty()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Invalid market provided for listing'),
  body('value').notEmpty().withMessage('Token value to list cannot be empty'),
]
