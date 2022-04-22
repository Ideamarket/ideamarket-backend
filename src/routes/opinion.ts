/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchAddressOpinionsByAddress,
  fetchAddressOpinionsByWallet,
  syncAllAddressOpinions,
} from '../controllers/opinion.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAddressOpinionsByAddressValidation,
  fetchAddressOpinionsByWalletValidation,
} from '../validations/opinion.validation'

export const opinionRouter = express.Router()

// -------------------- ROUTES -------------------- //

opinionRouter.get(
  '/address',
  fetchAddressOpinionsByAddressValidation,
  validateRequest,
  fetchAddressOpinionsByAddress
)

opinionRouter.get(
  '/address/wallet',
  fetchAddressOpinionsByWalletValidation,
  validateRequest,
  fetchAddressOpinionsByWallet
)

opinionRouter.patch('/address', syncAllAddressOpinions)
