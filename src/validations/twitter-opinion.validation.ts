import { query, body } from 'express-validator'

export const createTwitterOpinionValidation = [
  body('ratedPostID')
    .notEmpty()
    .withMessage('ratedPostID cannot be empty/null'),
  body('rating').notEmpty().withMessage('rating cannot be empty/null'),
]

export const fetchTwitterOpinionsValidation = [
  // query('tokenAddress')
  //   .notEmpty()
  //   .isString()
  //   .toLowerCase()
  //   .withMessage('tokenAddress cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn(['rating', 'ratedAt'])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchTwitterOpinionValidation = [
  query('opinionID')
    .notEmpty()
    .isString()
    .toLowerCase()
    .withMessage('opinionID cannot be empty'),
]
