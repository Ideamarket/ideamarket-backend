import { body, query } from 'express-validator'

const OWNER_REQ_MSG = 'Owner is required'

export const querySubgraphValidation = [
  body('query').notEmpty().withMessage('Query is required'),
]

export const fetchWalletHoldingsValidation = [
  query('owner').notEmpty().isString().withMessage(OWNER_REQ_MSG),
  query('marketIds').notEmpty().withMessage('MarketIds cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const fetchTradesValidation = [
  query('owner').notEmpty().isString().withMessage(OWNER_REQ_MSG),
  query('marketIds').notEmpty().withMessage('MarketIds cannot be empty'),
  query('orderBy')
    .notEmpty()
    .isString()
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]
