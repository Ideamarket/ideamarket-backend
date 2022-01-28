import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import { fetchByUrl } from '../services/url-metadata.service'

export async function fetchUrlMetadata(req: Request, res: Response) {
  try {
    const url = req.body.url as string
    return handleSuccess(res, await fetchByUrl(url))
  } catch (error) {
    return handleError(res, error, 'Unable to fetch version')
  }
}
