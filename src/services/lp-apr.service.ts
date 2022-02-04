import { LPAprModel } from 'models/lp-apr.model'

export function fetchLatestLPAprFromDB() {
  return new Promise((resolve) => {
    LPAprModel.findOne({}, {}, { sort: { createdAt: -1 } })
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
