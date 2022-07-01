import { body, query } from 'express-validator'

export const fetchAllBountiesValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn(['bountyID', 'tokenID', 'token', 'amount', 'status'])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const syncAllBountiesValidation = [
  body('bountyID')
    .optional()
    .isNumeric()
    .withMessage('bountyID should be numeric'),
]
