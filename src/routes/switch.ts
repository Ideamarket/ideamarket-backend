/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  addSwitch,
  deleteSwitch,
  fetchSwitch,
  updateSwitch,
} from '../controllers/switch.controller'
import {
  authenticate,
  authenticateAndSetAccount,
} from '../middleware/authentication'
import { authorizeAdmin } from '../middleware/authorization'
import { validateRequest } from '../middleware/validateRequest'
import {
  addSwitchValidation,
  deleteSwitchValidation,
  fetchSwitchValidation,
  updateSwitchValidation,
} from '../validations/switch.validation'

const switchRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Add Switch
switchRouter.post(
  '',
  authenticateAndSetAccount,
  authorizeAdmin,
  addSwitchValidation,
  validateRequest,
  addSwitch
)

// Update Switch
switchRouter.patch(
  '',
  authenticateAndSetAccount,
  authorizeAdmin,
  updateSwitchValidation,
  validateRequest,
  updateSwitch
)

// Fetch Switch
switchRouter.get(
  '',
  authenticate,
  fetchSwitchValidation,
  validateRequest,
  fetchSwitch
)

// Delete Switch
switchRouter.delete(
  '',
  authenticateAndSetAccount,
  authorizeAdmin,
  deleteSwitchValidation,
  validateRequest,
  deleteSwitch
)

export { switchRouter }
