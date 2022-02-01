import ogs from 'ts-open-graph-scraper'

import type { IUrlMetadata } from '../models/url-metadata.model'
import { UrlMetadataModel } from '../models/url-metadata.model'
import { getDateAfterXDays } from '../util'

export function extractMetadataFromOGS(url: string) {
  return ogs({ url: encodeURI(url) })
}

export async function fetchMetadata(url: string) {
  let urlMetadataDoc = await UrlMetadataModel.findOne({ url })

  if (urlMetadataDoc && Date.now() < urlMetadataDoc.expiresAt.getTime()) {
    return createUrlMetadataResponse(urlMetadataDoc as IUrlMetadata)
  }

  const metadataFromOGS = await extractMetadataFromOGS(url)
  const { ogTitle, ogDescription, ogImage, ogType } = metadataFromOGS

  urlMetadataDoc = await saveUrlMetadata({
    ogImage: ogImage ? ogImage[0].url : undefined,
    ogTitle: ogTitle as string,
    ogDescription: ogDescription as string,
    ogType: ogType as string,
    favicon: ogImage ? ogImage[0].url : undefined,
    url,
    expiresAt: getDateAfterXDays(7),
  })

  return createUrlMetadataResponse(urlMetadataDoc as IUrlMetadata)
}

export function saveUrlMetadata(model: IUrlMetadata) {
  const query = { url: model.url }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return UrlMetadataModel.findOneAndUpdate(query, model, options)
}

function createUrlMetadataResponse(data: IUrlMetadata) {
  return {
    ogTitle: data.ogTitle,
    ogDescription: data.ogDescription,
    ogType: data.ogType,
    ogImage: data.ogImage,
    favicon: data.favicon,
  }
}
