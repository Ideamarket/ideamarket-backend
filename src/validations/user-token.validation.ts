import { body, header, oneOf, query } from 'express-validator'

import { isValidUsername } from '../util/accountUtil'

// Error Messages
const SIGNED_WALLET_ADDRESS_REQ = 'Signed Wallet Address is required'
const MESSAGE_REQ = 'Message is required'
const MESSAGE_NOT_VALID = 'Message is not valid'
const SIGNATURE_REQ = 'Signature  is required'
const SIGNATURE_NOT_VALID = 'Signature is not valid'

// Validators
export const createUserValidation = [
  body('walletAddress')
    .notEmpty()
    .isString()
    .withMessage('walletAddress cannot be null/empty and should be string'),
]

export const signInUserValidation = [
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

export const updateuserTokenValidation = [
  body('username')
    .optional()
    .toLowerCase()
    .custom(isValidUsername)
    .withMessage('Username is not valid'),
  body('name').optional().isString().withMessage('Name is not valid'),
  body('bio')
    .optional()
    .isString()
    .isLength({ min: 0, max: 200 })
    .withMessage('Bio should be string and be within 200 characters'),
  body('profilePhoto')
    .optional()
    .isString()
    .withMessage('Profile photo is not valid'),
]

export const fetchUserTokenValidation = [
  oneOf(
    [
      header('Authorization')
        .notEmpty()
        .withMessage('Authorization header is required'),
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
    'Either authorization header or username or walletAddress is mandatory'
  ),
]

export const sendUserTokenEmailVerificationCodeValidation = [
  query('email')
    .notEmpty()
    .toLowerCase()
    .isEmail()
    .withMessage('Email is not valid'),
]

export const checkUserTokenEmailVerificationCodeValidation = [
  body('email')
    .notEmpty()
    .toLowerCase()
    .isEmail()
    .withMessage('Email is not valid'),
  body('code').notEmpty().withMessage('Code is required to verify the email'),
]

export const fetchAllUserTokensValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'walletAddress',
      'username',
      'email',
      'tokenAddress',
      'price',
      'dayChange',
      'weekChange',
      'deposits',
      'holders',
      'yearIncome',
      'claimableIncome',
      'totalRatingsCount',
      'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const syncAllUserTokensValidation = [
  body('walletAddress')
    .optional()
    .isString()
    .withMessage('walletAddress should be string'),
]
