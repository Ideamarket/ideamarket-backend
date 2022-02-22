import { body, oneOf } from 'express-validator'

import { TriggerType } from '../models/trigger.model'
import { isMarketIdValid } from '../util/marketUtil'

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
  oneOf(
    [
      [
        body('triggerData.marketId')
          .notEmpty()
          .custom(isMarketIdValid)
          .withMessage('triggerData.marketId is not valid or null/empty'),
        body('triggerData.tokenId')
          .notEmpty()
          .isInt()
          .withMessage('triggerData.tokenId is not valid or null/empty'),
        body('triggerData.categories')
          .optional()
          .isString()
          .withMessage('triggerData.categories is not valid'),
      ],
    ],
    'triggerData is not valid'
  ),
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
