/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  createUser,
  fetchUserPublicProfile,
  fetchUser,
  updateUser,
  uploadUserProfilePhoto,
  authenticateUser,
} from '../controllers/user-accounts.controller'
import {
  authenticate,
  authenticateAndSetUser,
} from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  authenticateUserValidation,
  createUserValidation,
  fetchUserPublicProfileValidation,
  fetchUserValidation,
  updateUserValidation,
} from '../validations/user-accounts.validation'

const userAccountsRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Authenticate User
userAccountsRouter.post(
  '/authenticate',
  authenticateUserValidation,
  validateRequest,
  authenticateUser
)
// Create User Account
userAccountsRouter.post('', createUserValidation, validateRequest, createUser)

// Update User Account
userAccountsRouter.patch(
  '',
  authenticateAndSetUser,
  updateUserValidation,
  validateRequest,
  updateUser
)

// Fetch User Account
userAccountsRouter.get(
  '',
  authenticateAndSetUser,
  fetchUserValidation,
  validateRequest,
  fetchUser
)

// Fetch User's Public Profile
userAccountsRouter.get(
  '/publicProfile',
  authenticate,
  fetchUserPublicProfileValidation,
  validateRequest,
  fetchUserPublicProfile
)

// Upload Profile Photo
userAccountsRouter.post('/profilePhoto', authenticate, uploadUserProfilePhoto)

export { userAccountsRouter }
