/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  request,
  submitted,
  feeTxConfirmed,
} from '../controllers/verification.controller'

const verificationRouter = express.Router()

verificationRouter.post('request', request)
verificationRouter.post('submitted', submitted)
verificationRouter.post('feeTxConfirmed', feeTxConfirmed)

export { verificationRouter }
