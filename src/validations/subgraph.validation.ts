import { body } from 'express-validator'

export const querySubgraphValidation = [
  body('query').notEmpty().withMessage('Query is required'),
]
