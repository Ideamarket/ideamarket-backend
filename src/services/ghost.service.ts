/* eslint-disable promise/prefer-await-to-then */
 
import type { IGhostListing } from '../models/ghost-listing.model'
import { GhostListingModel } from '../models/ghost-listing.model'
import { ObjectAlreadyExistsError } from './errors'

/* eslint-disable import/no-default-export */
async function fetchAllByMarket(marketId: number, page = 0, count = 50) {
  const filter: any = {}

  if (marketId > 0) {
    filter.marketId = marketId
  }

  return GhostListingModel.paginate(filter, {
    limit: count,
    offset: page * count,
    sort: { createdAt: -1 },
    populate: 'user',
  })
}

function addToListing(model: IGhostListing) {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    GhostListingModel.findOne({
      value: model.value,
      marketId: model.marketId,
    })
      .then((m) => {
        if (m) {
          reject(new ObjectAlreadyExistsError(model.value))
        }

        return GhostListingModel.create({ ...model })
      })
      .then((item) => {
        resolve(item)
      })
  })
}

const ghost = {
  fetchAllByMarket,
  addToListing,
}

export default ghost
