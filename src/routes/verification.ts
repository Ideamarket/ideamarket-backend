import express from 'express'

import {
  request,
  submitted,
  feeTxConfirmed,
} from '../controllers/verification.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  verificationFeeTxConfirmationValidation,
  verificationRequestValidation,
  verificationSubmitionValidation,
} from '../validations/verification.validation'

const verificationRouter = express.Router()

verificationRouter.post(
  '/request',
  verificationRequestValidation,
  validateRequest,
  request
)

verificationRouter.post(
  '/submitted',
  verificationSubmitionValidation,
  validateRequest,
  submitted
)

verificationRouter.post(
  '/feeTxConfirmed',
  verificationFeeTxConfirmationValidation,
  validateRequest,
  feeTxConfirmed
)

export { verificationRouter }
