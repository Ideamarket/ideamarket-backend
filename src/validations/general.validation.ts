import { body, query } from 'express-validator'

export const fetchUrlMetadataValidation = [
  body('url')
    .notEmpty()
    .withMessage('url cannot be empty or null')
    .isString()
    .isURL()
    .withMessage('url is not valid'),
]

export const fetchValidUrlValidation = [
  query('url')
    .notEmpty()
    .withMessage('url cannot be empty or null')
    .isString()
    .isURL()
    .withMessage('url is not valid'),
]
