/* eslint-disable promise/prefer-await-to-then */

import type { IListing } from '../models/listing.model'
import { ListingModel } from '../models/listing.model'
import { ObjectAlreadyExistsError } from './errors'

export function fetchByMarket(
  marketType: string,
  marketId: number,
  skip = 0,
  limit = 50
) {
  const filter: any = {}

  if (marketId > 0) {
    filter.marketId = marketId
  }

  filter.marketType = marketType

  return ListingModel.paginate(filter, {
    limit,
    offset: skip,
    sort: { createdAt: -1 },
    populate: 'user',
  })
}

export function addNewListing(model: IListing) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    ListingModel.findOne({
      value: model.value,
      marketId: model.marketId,
      marketType: model.marketType,
    })
      .then((m) => {
        if (m) {
          reject(new ObjectAlreadyExistsError(model.value))
        }

        return ListingModel.create(model)
      })
      .then((item) => {
        resolve(item)
      })
  })
}
