import og from 'ts-open-graph-scraper'

import type { IUrlMetadataModel } from '../models/url-metadata.model'
import { UrlMetadataModel } from '../models/url-metadata.model'

export function extract(url: string) {
  return og({ url })
}

export async function fetchByUrl(url: string) {
  let data = await UrlMetadataModel.findOne({ url })

  if (data && Date.now() < data.expiresAt.getTime()) {
    return createUrlMetadataResponse(data as IUrlMetadataModel)
  }

  const extractRet = await extract(url)

  const { ogTitle, ogDescription, ogImage } = extractRet

  data = await saveUrlMetadata({
    ogImage: ogImage ? ogImage[0].url : undefined,
    ogTitle: ogTitle as string,
    ogDescription: ogDescription as string,
    favicon: ogImage ? ogImage[0].url : undefined,
    url,
    expiresAt: createExpiryDate(new Date(), 7),
  })

  return createUrlMetadataResponse(data as IUrlMetadataModel)
}

export function saveUrlMetadata(model: IUrlMetadataModel) {
  const query = { url: model.url }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return UrlMetadataModel.findOneAndUpdate(query, model, options)
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
