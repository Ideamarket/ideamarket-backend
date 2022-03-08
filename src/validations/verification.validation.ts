import { body } from 'express-validator'

export const verificationRequestValidation = [
  body('tokenAddress')
    .notEmpty()
    .isString()
    .withMessage('Token address is required'),
  body('ownerAddress')
    .notEmpty()
    .isString()
    .withMessage('Owner address is required.'),
  body('chain').notEmpty().isString().withMessage('Chain is required.'),
]

export const verificationSubmitionValidation = [
  body('uuid').notEmpty().isString().withMessage('uuid is required'),
]

export const verificationFeeTxConfirmationValidation = [
  body('uuid').notEmpty().isString().withMessage('uuid is required'),
  body('tx').notEmpty().isString().withMessage('tx is required'),
]
