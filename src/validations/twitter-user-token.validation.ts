import { body, oneOf, query, header } from 'express-validator'

export const completeTwitterLoginValidation = [
  body('requestToken')
    .notEmpty()
    .isString()
    .withMessage('requestToken is not valid or null/empty'),
  body('oAuthVerifier')
    .notEmpty()
    .isString()
    .withMessage('oAuthVerifier is not valid or null/empty'),
]

export const fetchTwitterUserTokenValidation = [
  oneOf(
    [
      header('Authorization')
        .notEmpty()
        .withMessage('Authorization header is required'),
      query('twitterUsername')
        .notEmpty()
        .withMessage('twitterUsername is required'),
      query('twitterUserTokenID')
        .notEmpty()
        .withMessage('twitterUserTokenID is required'),
    ],
    'Either twitterUsername or walletAddress is mandatory'
  ),
]

export const fetchAllTwitterUserTokensValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'twitterUsername',
      // 'totalRatingsCount',
      // 'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]
