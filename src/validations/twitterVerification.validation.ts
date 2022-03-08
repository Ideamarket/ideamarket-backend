import { body, param } from 'express-validator'

import { TwitterVerificationType } from '../models/twitterVerification.model'

export const generateAuthorizationUrlValidation = [
  body('verificationType')
    .notEmpty()
    .isString()
    .isIn(Object.keys(TwitterVerificationType))
    .withMessage('VerificationType is not valid or null/empty'),
  body('listingId')
    .if(body('verificationType').equals(TwitterVerificationType.LISTING))
    .notEmpty()
    .withMessage('ListingId is required'),
]

export const initiateVerificationValidation = [
  body('requestToken')
    .notEmpty()
    .isString()
    .withMessage('RequestToken is not valid or null/empty'),
  body('oAuthVerifier')
    .notEmpty()
    .isString()
    .withMessage('oAuthVerifier is not valid or null/empty'),
]

export const completeVerificationValidation = [
  body('requestToken')
    .notEmpty()
    .isString()
    .withMessage('RequestToken is not valid or null/empty'),
  body('text')
    .notEmpty()
    .isString()
    .withMessage('text is not valid or null/empty'),
]

export const fetchTwitterProfileValidation = [
  param('username')
    .notEmpty()
    .isString()
    .withMessage('Username is not valid or null/empty'),
]
