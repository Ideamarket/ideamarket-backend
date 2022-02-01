import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import { fetchLatestAprFromDB } from '../services/apr.service'
import { fetchByUrl } from '../services/url-metadata.service'

export async function fetchUrlMetadata(req: Request, res: Response) {
  try {
    const url = req.body.url as string
    return handleSuccess(res, await fetchByUrl(url))
  } catch (error) {
    return handleError(res, error, 'Unable to fetch URL metadata')
  }
}

export async function fetchLatestApr(req: Request, res: Response) {
  try {
    return handleSuccess(res, { apr: await fetchLatestAprFromDB() })
  } catch (error) {
    return handleError(res, error, 'Unable to fetch version')
  }
}
