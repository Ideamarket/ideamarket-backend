import { AprModel } from '../models/apr.model'

export function fetchLatestAprFromDB() {
  return new Promise((resolve) => {
    AprModel.findOne({}, {}, { sort: { createdAt: -1 } })
      // eslint-disable-next-line promise/prefer-await-to-then
      .then((result: any) => {
        resolve((result.value as number) || 0)
      })
      // eslint-disable-next-line promise/prefer-await-to-then
      .catch(() => {
        resolve(0)
      })
  })
}
