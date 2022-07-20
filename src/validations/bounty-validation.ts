import { query } from 'express-validator'

export const fetchAllBountiesValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn(['tokenID', 'token', 'amount', 'status', 'groupAmount'])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const syncAllBountiesValidation = []
