import type { Response } from 'express'

import { logger } from '../lib/logger'

export const handleError = (res: Response, error: any, message: string) => {
  const cause = findCause(error)

  if (cause.custom) {
    logger.error(
      `${message}. Error: ${cause.message as string}. Stack: ${
        cause.stack as string
      }`
    )
  } else {
    logger.error(`${message}. Cause: ${error.message as string}`)
  }

  return res.status(500).json({ success: false, message, error })
}

export const handleSuccess = (res: Response, data: any) => {
  return res.status(200).json({
    success: true,
    data,
  })
}

export const handlePagingSuccess = (res: Response, data: any) => {
  return res.status(200).json({
    success: true,
    data: data.docs,
    total: data.total,
  })
}

const findCause = (sourceError: any) => {
  let error = sourceError
  while (error.parent && error.custom) {
    error = error.parent
  }

  return error
}
