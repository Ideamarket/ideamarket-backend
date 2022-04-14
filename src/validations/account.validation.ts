import { body, oneOf, query } from 'express-validator'

import { isValidUsername } from '../util/accountUtil'

// Error Messages
const SIGNED_WALLET_ADDRESS_REQ = 'Signed Wallet Address is required'
const MESSAGE_REQ = 'Message is required'
const MESSAGE_NOT_VALID = 'Message is not valid'
const SIGNATURE_REQ = 'Signature  is required'
const SIGNATURE_NOT_VALID = 'Signature is not valid'

// Validators
export const removeAllUsernamesValidation = [
  body('verified').optional().isBoolean().withMessage('Verified is not valid'),
]

export const signInAccountValidation = [
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

export const updateAccountValidation = [
  body('username')
    .optional()
    .toLowerCase()
    .custom(isValidUsername)
    .withMessage('Username is not valid'),
  body('name').optional().isString().withMessage('Name is not valid'),
  body('bio').optional().isString().withMessage('Bio is not valid'),
  body('profilePhoto')
    .optional()
    .isString()
    .withMessage('Profile photo is not valid'),
]

export const fetchPublicAccountProfileValidation = [
  oneOf(
    [
      query('username')
        .notEmpty()
        .toLowerCase()
        .withMessage('Username is required')
        .custom(isValidUsername)
        .withMessage('Username is not valid'),
      query('walletAddress')
        .notEmpty()
        .withMessage('walletAddress is required'),
    ],
    'Either username or walletAddress is mandatory'
  ),
]

export const sendAccountEmailVerificationCodeValidation = [
  query('email')
    .notEmpty()
    .toLowerCase()
    .isEmail()
    .withMessage('Email is not valid'),
]

export const checkAccountEmailVerificationCodeValidation = [
  body('email')
    .notEmpty()
    .toLowerCase()
    .isEmail()
    .withMessage('Email is not valid'),
  body('code').notEmpty().withMessage('Code is required to verify the email'),
]
