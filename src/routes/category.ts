import express from 'express'

import {
  addCategory,
  fetchCategory,
  updateCategory,
} from '../controllers/category.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  addCategoryValidation,
  fetchCategoryValidation,
  updateCategoryValidation,
} from '../validations/category.validation'

export const categoryRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Add Category
categoryRouter.post('', addCategoryValidation, validateRequest, addCategory)

// Update Category
categoryRouter.patch(
  '',
  updateCategoryValidation,
  validateRequest,
  updateCategory
)

// Fetch Category
categoryRouter.get(
  '/:id',
  fetchCategoryValidation,
  validateRequest,
  fetchCategory
)
