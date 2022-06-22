/* eslint-disable sonarjs/no-duplicate-string */
import { body, oneOf, query } from 'express-validator'

export const fetchAllPostsValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'tokenID',
      'averageRating',
      'compositeRating',
      'marketInterest',
      'postedAt',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fecthPostValidation = [
  oneOf(
    [
      query('tokenID').notEmpty().withMessage('tokenID cannot be empty/null'),
      query('content')
        .notEmpty()
        .isString()
        .withMessage('content cannot be empty and should be a valid string'),
    ],
    'Either tokenID/content is required'
  ),
]

export const fecthPostCitationsValidation = [
  query('contractAddress').optional().toLowerCase(),
  query('tokenID').notEmpty().withMessage('tokenID cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'averageRating',
      'compositeRating',
      'marketInterest',
      'postedAt',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fecthCitedByPostsValidation = [
  query('contractAddress').optional().toLowerCase(),
  query('tokenID').notEmpty().withMessage('tokenID cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'averageRating',
      'compositeRating',
      'marketInterest',
      'postedAt',
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
    .isIn(['tokenID', 'ratedBy', 'ratedAt', 'rating', 'deposits'])
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
      'compositeRating',
      'marketInterest',
      'totalRatingsCount',
      'latestRatingsCount',
      'totalCommentsCount',
      'latestCommentsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const syncAllPostsValidation = [
  body('tokenID')
    .optional()
    .isNumeric()
    .withMessage('tokenID should be numeric'),
]

export const fetchPostCompositeRatingsValidation = [
  oneOf(
    [
      query('postId')
        .optional()
        .isString()
        .withMessage('postId should be a string'),
      query('tokenID')
        .optional()
        .isNumeric()
        .withMessage('tokenID should be numeric'),
    ],
    'Either postId / tokenID is mandatory'
  ),
  query('startDate')
    .notEmpty()
    .isString()
    .withMessage('startDate should be a yyyy-mm-dd string'),
  query('endDate')
    .optional()
    .isString()
    .withMessage('endDate should be a yyyy-mm-dd string'),
]
