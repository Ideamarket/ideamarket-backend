import type { Request, Response } from 'express'
import { fetchLatestLPAprFromDB } from 'services/lp-apr.service'

import { handleSuccess, handleError } from '../lib/base'
import { fetchLatestAprFromDB } from '../services/apr.service'
import { checkAndReturnValidUrl } from '../services/general.service'
import { fetchMetadata } from '../services/url-metadata.service'
import { normalize } from '../util'

export async function fetchUrlMetadata(req: Request, res: Response) {
  try {
    const url = decodeURI(req.body.url as string)
    const urlMetaData = await fetchMetadata(url)

    return handleSuccess(res, urlMetaData)
  } catch (error) {
    console.error('Error occurred while fetching url metadata', error)
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

export async function fetchLatestLPApr(req: Request, res: Response) {
  try {
    return handleSuccess(res, { apr: await fetchLatestLPAprFromDB() })
  } catch (error) {
    return handleError(res, error, 'Unable to fetch version')
  }
}

export async function fetchValidUrl(req: Request, res: Response) {
  try {
    const url = decodeURI(req.query.url as string)
    const validUrl = await checkAndReturnValidUrl(normalize(url))

    return handleSuccess(res, {
      validUrl: validUrl ? decodeURI(validUrl) : null,
    })
  } catch (error) {
    console.error('Error occurred while fetching valid url', error)
    return handleError(res, error, 'Unable to fetch valid URL')
  }
}
