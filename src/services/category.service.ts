import type { ICategory } from '../models/category.model'
import { CategoryModel } from '../models/category.model'
import { mapCategory } from '../util/categoryUtil'
import { EntityNotFoundError, InternalServerError } from './errors'

export async function addNewCategory(categoryReq: ICategory) {
  try {
    const category = CategoryModel.build(categoryReq)
    const categoryDoc = await CategoryModel.create(category)

    return mapCategory(categoryDoc)
  } catch (error) {
    console.error('Error occurred while adding the category', error)
    throw new InternalServerError('Failed to add new category')
  }
}

export async function updateExistingCategory({
  categoryId,
  categoryReq,
}: {
  categoryId: string
  categoryReq: ICategory
}) {
  try {
    const updatedCategoryDoc = await CategoryModel.findOneAndUpdate(
      { _id: categoryId },
      { $set: categoryReq },
      { new: true }
    )

    return mapCategory(updatedCategoryDoc)
  } catch (error) {
    console.error('Error occurred while updating the category', error)
    throw new InternalServerError('Failed to update the category')
  }
}

export async function fetchCategoryById(categoryId: string) {
  try {
    const category = await CategoryModel.findById(categoryId)
    if (!category) {
      throw new EntityNotFoundError(null, 'Category doesnot exist')
    }

    return mapCategory(category)
  } catch (error) {
    console.error('Error occurred while fetching the category', error)
    throw new InternalServerError('Failed to fetch the category')
  }
}
