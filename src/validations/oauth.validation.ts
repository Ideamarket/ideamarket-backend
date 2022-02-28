import { body, param } from 'express-validator'

export const fetchTwitterRequestTokenValidation = []

export const fetchTwitterAccessTokenValidation = [
  body('requestToken')
    .notEmpty()
    .isString()
    .withMessage('RequestToken is not valid or null/empty'),
  body('oAuthVerifier')
    .notEmpty()
    .isString()
    .withMessage('oAuthVerifier is not valid or null/empty'),
]

export const postTweetValidation = [
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
