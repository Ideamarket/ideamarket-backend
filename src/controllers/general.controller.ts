import type { Request, Response } from 'express'
import type { IUrlMetadataModel } from 'models/url-metadata.model'
import type { OpenGraphImage } from 'open-graph-scraper'

import { handleSuccess, handleError } from '../lib/base'
import {
  extract as extractMetadata,
  fetchByUrl,
  saveUrlMetadata,
} from '../services/url-metadata.service'

export async function fetchUrlMetadata(req: Request, res: Response) {
  try {
    const url = req.body.url as string

    let data = await fetchByUrl(url)

    if (data && Date.now() < data.expiresAt.getTime()) {
      return handleSuccess(
        res,
        createUrlMetadataResponse(data as IUrlMetadataModel)
      )
    }

    const extractRet = await extractMetadata(req.body.url as string)

    if (extractRet.error) {
      return handleSuccess(res, null)
    }

    const { ogTitle, favicon, ogDescription, ogImage } = extractRet.result

    data = await saveUrlMetadata({
      ogImage: ogImage ? (ogImage as OpenGraphImage).url : undefined,
      ogTitle: ogTitle as string,
      ogDescription: ogDescription as string,
      favicon: favicon as string,
      url,
      expiresAt: createExpiryDate(new Date(), 7),
    })

    return handleSuccess(
      res,
      createUrlMetadataResponse(data as IUrlMetadataModel)
    )
  } catch (error) {
    return handleError(res, error, 'Unable to fetch version')
  }
}

const createExpiryDate = (date: Date, days: number) => {
   
  const todayDate = new Date(date)
   
  return new Date(todayDate.setDate(todayDate.getDate() + days))
}

const createUrlMetadataResponse = (data: IUrlMetadataModel) => {
  return {
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    ogImage: data.ogImage,
    favicon: data.favicon,
  }
}
