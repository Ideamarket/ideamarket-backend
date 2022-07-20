import express from 'express'

import {
  fetchAllBounties,
  syncAllBounties,
} from '../controllers/bounty-controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllBountiesValidation,
  syncAllBountiesValidation,
} from '../validations/bounty-validation'

export const bountyRouter = express.Router()

bountyRouter.get(
  '',
  fetchAllBountiesValidation,
  validateRequest,
  fetchAllBounties
)

bountyRouter.patch(
  '/sync',
  syncAllBountiesValidation,
  validateRequest,
  syncAllBounties
)
