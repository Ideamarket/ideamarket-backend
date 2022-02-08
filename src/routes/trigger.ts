import express from 'express'

import { addTrigger, resolveTriggers } from '../controllers/trigger.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  addTriggerValidation,
  resolveTriggersValidation,
} from '../validations/trigger.validation'

export const triggerRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Add New Trigger
triggerRouter.post('', addTriggerValidation, validateRequest, addTrigger)

// Resolve Triggers
triggerRouter.post(
  '/resolve',
  resolveTriggersValidation,
  validateRequest,
  resolveTriggers
)
