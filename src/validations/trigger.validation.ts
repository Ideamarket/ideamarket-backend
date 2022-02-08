import { body } from 'express-validator'

import { TriggerType } from '../models/trigger.model'

export const addTriggerValidation = [
  body('type')
    .notEmpty()
    .withMessage('Type cannot be null/empty')
    .isString()
    .custom(isValidTriggerType)
    .withMessage('Type is not valid'),
  body('triggerData')
    .notEmpty()
    .withMessage('Trigger data cannot be null/empty'),
]

export const resolveTriggersValidation = [
  body('type')
    .notEmpty()
    .withMessage('Type cannot be null/empty')
    .isString()
    .custom(isValidTriggerType)
    .withMessage('Type is not valid'),
]

function isValidTriggerType(type: string) {
  return Object.keys(TriggerType).includes(type)
}
