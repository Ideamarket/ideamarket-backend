/* eslint-disable sonarjs/no-duplicate-string */
import { oneOf, query } from 'express-validator'

export const fetchAllTwitterPostsValidation = [
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
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchTwitterPostValidation = [
  oneOf(
    [
      query('postID').notEmpty().withMessage('postID cannot be empty/null'),
      query('content')
        .notEmpty()
        .isString()
        .withMessage('content cannot be empty and should be a valid string'),
    ],
    'Either postID/content is required'
  ),
]

export const fetchPostCitationsValidation = [
  query('postID').notEmpty().withMessage('postID cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'averageRating',
      'marketInterest',
      'postedAt',
      'totalRatingsCount',
      'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchCitedByPostsValidation = [
  query('postID').notEmpty().withMessage('postID cannot be empty/null'),
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
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchPostOpinionsByTwitterUsernameValidation = [
  query('twitterUsername')
    .notEmpty()
    .isString()
    .toLowerCase()
    .withMessage('twitterUsername cannot be empty/null'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'ratedAt',
      'rating',
      'averageRating',
      'compositeRating',
      'marketInterest',
      'totalRatingsCount',
      'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
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
