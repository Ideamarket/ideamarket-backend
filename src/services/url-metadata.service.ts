import og from 'open-graph-scraper'

import type { IUrlMetadataModel } from '../models/url-metadata.model'
import { UrlMetadataModel } from '../models/url-metadata.model'

export function extract(url: string) {
  return og({ url })
}

export function fetchByUrl(url: string) {
  return UrlMetadataModel.findOne({ url })
}

export function saveUrlMetadata(model: IUrlMetadataModel) {
  const query = { url: model.url }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }
  return UrlMetadataModel.findOneAndUpdate(query, model, options)
}
