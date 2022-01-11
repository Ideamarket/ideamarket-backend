/* eslint-disable sonarjs/no-duplicate-string */

import { body, query } from 'express-validator'

import { isUsernameAvailable, isValidUsername } from '../util/userUtil'

// Error Messages
const SIGNED_WALLET_ADDRESS_REQ = 'Signed Wallet Address is required'
const MESSAGE_REQ = 'Message is required'
const MESSAGE_NOT_VALID = 'Message is not valid'
const SIGNATURE_REQ = 'Signature  is required'
const SIGNATURE_NOT_VALID = 'Signature is not valid'

// Validators
export const authenticateUserValidation = [
  body('signedWalletAddress').notEmpty().withMessage(SIGNED_WALLET_ADDRESS_REQ),
  body('signedWalletAddress.message')
    .notEmpty()
    .withMessage(MESSAGE_REQ)
    .isString()
    .withMessage(MESSAGE_NOT_VALID),
  body('signedWalletAddress.signature')
    .notEmpty()
    .withMessage(SIGNATURE_REQ)
    .isString()
    .withMessage(SIGNATURE_NOT_VALID),
]

export const createUserValidation = [
  body('signedWalletAddress').notEmpty().withMessage(SIGNED_WALLET_ADDRESS_REQ),
  body('signedWalletAddress.message')
    .notEmpty()
    .withMessage(MESSAGE_REQ)
    .isString()
    .withMessage(MESSAGE_NOT_VALID),
  body('signedWalletAddress.signature')
    .notEmpty()
    .withMessage(SIGNATURE_REQ)
    .isString()
    .withMessage(SIGNATURE_NOT_VALID),
  body('username')
    .optional()
    .custom(isValidUsername)
    .withMessage('Username is not valid')
    .custom(isUsernameAvailable)
    .withMessage('Username is not available'),
  body('name').optional().isString().withMessage('Name is not valid'),
  body('email').optional().isEmail().withMessage('Email is not valid'),
  body('bio').optional().isString().withMessage('Bio is not valid'),
  body('profilePhoto')
    .optional()
    .isString()
    .withMessage('Profile photo is not valid'),
  body('visibilityOptions.email')
    .optional()
    .isBoolean()
    .withMessage('email visibility option should be boolean'),
  body('visibilityOptions.bio')
    .optional()
    .isBoolean()
    .withMessage('bio visibility option should be boolean'),
  body('visibilityOptions.ethAddress')
    .optional()
    .isBoolean()
    .withMessage('eth address visibility option should be boolean'),
]

export const updateUserValidation = [
  body('username')
    .optional()
    .custom(isValidUsername)
    .withMessage('Username is not valid'),
  body('name').optional().isString().withMessage('Name is not valid'),
  body('email').optional().isEmail().withMessage('Email is not valid'),
  body('bio').optional().isString().withMessage('Bio is not valid'),
  body('profilePhoto')
    .optional()
    .isString()
    .withMessage('Profile photo is not valid'),
  body('visibilityOptions.email')
    .optional()
    .isBoolean()
    .withMessage('email visibility option should be boolean'),
  body('visibilityOptions.bio')
    .optional()
    .isBoolean()
    .withMessage('bio visibility option should be boolean'),
  body('visibilityOptions.ethAddress')
    .optional()
    .isBoolean()
    .withMessage('eth address visibility option should be boolean'),
]

export const fetchUserValidation = []

export const fetchUserPublicProfileValidation = [
  query('username')
    .notEmpty()
    .withMessage('Username is required')
    .custom(isValidUsername)
    .withMessage('Username is not valid'),
]
