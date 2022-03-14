import { query } from 'express-validator'

export const getLambdaAvatarValidation = [
  query('provider').notEmpty().isString().withMessage('Provider is required'),
  query('value').notEmpty().isString().withMessage('Value is required'),
]
