/* eslint-disable sonarjs/no-duplicate-string */
import { param, query } from 'express-validator'

export const fetchAllPostsValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'tokenID',
      'averageRating',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fecthPostOpinionsByTokenIdValidation = [
  query('contractAddress').optional().toLowerCase(),
  query('tokenID').notEmpty().withMessage('tokenID cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn(['tokenID', 'ratedBy', 'ratedAt', 'rating'])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fecthPostOpinionsByWalletValidation = [
  query('contractAddress').optional().toLowerCase(),
  query('walletAddress')
    .notEmpty()
    .isString()
    .toLowerCase()
    .withMessage('walletAddress cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'tokenID',
      'ratedAt',
      'rating',
      'averageRating',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const syncAllPostsValidation = [
  param('tokenID')
    .optional()
    .isNumeric()
    .withMessage('tokenID should be numeric'),
]
