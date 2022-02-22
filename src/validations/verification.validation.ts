import { body } from 'express-validator'

export const verificationRequestValidation = [
  body('tokenAddress')
    .notEmpty()
    .isString()
    .withMessage('Token address is missing'),
  body('ownerAddress')
    .notEmpty()
    .isString()
    .withMessage('Owner address is missing.'),
  body('chain').notEmpty().isString().withMessage('Chain is missing.'),
]
