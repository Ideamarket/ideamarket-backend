import { body, query } from 'express-validator'

export const addSwitchValidation = [
  body('feature').notEmpty().isString().withMessage('Feature is required'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled should be boolean'),
]

export const updateSwitchValidation = [
  body('feature').notEmpty().isString().withMessage('Feature is required'),
  body('enabled')
    .notEmpty()
    .isBoolean()
    .withMessage('Enabled is required and should be boolean'),
]

export const fetchSwitchValidation = [
  query('value').notEmpty().isString().withMessage('Value is required'),
]

export const deleteSwitchValidation = [
  query('value').notEmpty().isString().withMessage('Value is required'),
]
