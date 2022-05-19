import { body } from 'express-validator'

export const completeVerificationValidation = [
  body('requestToken')
    .notEmpty()
    .isString()
    .withMessage('requestToken is not valid or null/empty'),
  body('oAuthVerifier')
    .notEmpty()
    .isString()
    .withMessage('oAuthVerifier is not valid or null/empty'),
]
