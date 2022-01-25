import { body, param } from 'express-validator'

export const marketTypeParamValidation = [
  param('marketType').notEmpty().isIn(['ghost', 'onchain']),
]

export const voteValidation = [
  ...marketTypeParamValidation,
  body('market').notEmpty().withMessage('Market field is required'),
  body('listing').notEmpty().withMessage('Listing field is required'),
]
