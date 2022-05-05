/* eslint-disable sonarjs/no-duplicate-string */
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
        body('type').isIn(['ONCHAIN_LISTING']).withMessage('Type is not valid'),
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
      [
        body('type').isIn(['ONCHAIN_LISTING']).withMessage('Type is not valid'),
        body('triggerData.marketId')
          .notEmpty()
          .custom(isMarketIdValid)
          .withMessage('triggerData.marketId is not valid or null/empty'),
        body('triggerData.tokenName')
          .notEmpty()
          .isString()
          .withMessage('triggerData.tokenName is not valid or null/empty'),
        body('triggerData.categories')
          .optional()
          .isString()
          .withMessage('triggerData.categories is not valid'),
      ],
      [
        body('type').isIn(['IDEAMARKET_POST']).withMessage('Type is not valid'),
        body('triggerData.tokenID')
          .notEmpty()
          .isInt()
          .withMessage('triggerData.tokenID is not valid or null/empty'),
      ],
      [
        body('type').isIn(['USER_TOKEN']).withMessage('Type is not valid'),
        body('triggerData.walletAddress')
          .notEmpty()
          .isString()
          .withMessage('triggerData.walletAddress is not valid or null/empty'),
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
