import { body, query } from 'express-validator'

import { AccountSource } from '../types/account.types'
import { isValidAccountSource, isValidUsername } from '../util/accountUtil'

// Error Messages
const SIGNED_WALLET_ADDRESS_REQ = 'Signed Wallet Address is required'
const MESSAGE_REQ = 'Message is required'
const MESSAGE_NOT_VALID = 'Message is not valid'
const SIGNATURE_REQ = 'Signature  is required'
const SIGNATURE_NOT_VALID = 'Signature is not valid'

// Validators
const accountValidation = [
  body('source')
    .notEmpty()
    .isString()
    .custom(isValidAccountSource)
    .withMessage('source cannot be empty/null and should be valid'),
  body('signedWalletAddress')
    .if(body('source').equals(AccountSource.WALLET))
    .notEmpty()
    .withMessage(SIGNED_WALLET_ADDRESS_REQ),
  body('signedWalletAddress.message')
    .if(body('source').equals(AccountSource.WALLET))
    .notEmpty()
    .withMessage(MESSAGE_REQ)
    .isString()
    .withMessage(MESSAGE_NOT_VALID),
  body('signedWalletAddress.signature')
    .if(body('source').equals(AccountSource.WALLET))
    .notEmpty()
    .withMessage(SIGNATURE_REQ)
    .isString()
    .withMessage(SIGNATURE_NOT_VALID),
  body('email')
    .if(body('source').equals(AccountSource.EMAIL))
    .notEmpty()
    .isString()
    .isEmail()
    .withMessage('email cannot be empty/null and should be valid'),
  body('code')
    .if(body('source').equals(AccountSource.EMAIL))
    .notEmpty()
    .withMessage('code cannot be empty/null'),
  body('googleIdToken')
    .if(body('source').equals(AccountSource.GOOGLE))
    .notEmpty()
    .isString()
    .withMessage('googleIdToken cannot be empty/null and should be valid'),
]

export const signInAccountValidation = accountValidation

export const linkAccountValidation = accountValidation

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
  query('username')
    .notEmpty()
    .toLowerCase()
    .withMessage('Username is required')
    .custom(isValidUsername)
    .withMessage('Username is not valid'),
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
