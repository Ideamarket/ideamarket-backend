import { body, oneOf, param } from 'express-validator'

export const fetchPostMetadataValidation = [
  oneOf(
    [param('tokenID').notEmpty().withMessage('tokenID cannot be empty/null')],
    'tokenID is required'
  ),
]

export const updatePostMetadataValidation = [
  oneOf(
    [body('tokenID').notEmpty().withMessage('tokenID cannot be empty/null')],
    'tokenID is required'
  ),
]
