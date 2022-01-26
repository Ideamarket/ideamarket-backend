import { param } from 'express-validator'

export const voteValidation = [param('listingId').notEmpty()]
