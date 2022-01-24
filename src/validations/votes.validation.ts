import { body, param } from 'express-validator'

export const voteValidation = [
  param('marketType').notEmpty().isIn(['ghost', 'onchain']),
  body('market').notEmpty().withMessage('Market field is required'),
  body('listing').notEmpty().withMessage('Listing field is required'),
]

export const marketTypeParamValidation = [
  param('marketType').notEmpty().isIn(['ghost', 'onchain']),
]
