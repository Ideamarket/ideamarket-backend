import { query } from 'express-validator'

export const fetchAddressOpinionsByAddressValidation = [
  query('tokenAddress')
    .notEmpty()
    .isString()
    .toLowerCase()
    .withMessage('tokenAddress cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn(['rating', 'ratedAt'])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchAddressOpinionsByWalletValidation = [
  query('walletAddress')
    .notEmpty()
    .isString()
    .toLowerCase()
    .withMessage('walletAddress cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'rating',
      'ratedAt',
      'averageRating',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]
