import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'

export async function fetchVersion(req: Request, res: Response) {
  try {
    // Refactor user-accounts to account
    const data = { version: '1.2' }
    return handleSuccess(res, data)
  } catch (error) {
    return handleError(res, error, 'Unable to fetch vote count')
  }
}
