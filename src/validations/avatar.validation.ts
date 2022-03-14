import { query } from 'express-validator'

import { providers } from '../util/avatar-providers'

export const getLambdaAvatarValidation = [
  query('provider').notEmpty().isString().withMessage('Provider is required'),
  query('provider')
    .isIn([...providers])
    .withMessage('Invalid provider'),
  query('value').notEmpty().isString().withMessage('Value is required'),
]
