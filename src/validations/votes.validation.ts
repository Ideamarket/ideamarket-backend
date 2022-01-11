import { body } from 'express-validator'

export const voteValidation = [
  body('market').notEmpty().withMessage('Market field is required'),
  body('listing').notEmpty().withMessage('Listing field is required'),
]
