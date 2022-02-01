import { body, query } from 'express-validator'

const LISTING_ID_NOT_EMPTY_MSG = 'ListingId cannot be empty or null'

export const fetchVoteCountValidation = [
  query('listingId')
    .notEmpty()
    .isString()
    .withMessage(LISTING_ID_NOT_EMPTY_MSG),
]

export const upVoteValidation = [
  body('listingId').notEmpty().isString().withMessage(LISTING_ID_NOT_EMPTY_MSG),
]

export const downVoteValidation = [
  body('listingId').notEmpty().isString().withMessage(LISTING_ID_NOT_EMPTY_MSG),
]

export const deleteUpVoteValidation = [
  body('listingId').notEmpty().isString().withMessage(LISTING_ID_NOT_EMPTY_MSG),
]

export const deleteDownVoteValidation = [
  body('listingId').notEmpty().isString().withMessage(LISTING_ID_NOT_EMPTY_MSG),
]
