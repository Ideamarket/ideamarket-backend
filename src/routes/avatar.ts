import express from 'express'

import { fetchAvatar } from '../controllers/avatar.controller'
import { validateRequest } from '../middleware/validateRequest'
import { getLambdaAvatarValidation } from '../validations/avatar.validation'

export const avatarRouter = express.Router()

// Fetch avatar url by username and provider
avatarRouter.get('', getLambdaAvatarValidation, validateRequest, fetchAvatar)
