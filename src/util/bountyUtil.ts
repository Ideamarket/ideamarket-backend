// import type { BountyDocument } from '../models/bounty-model'
// import type { BountyResponse } from '../types/bounty-types'
import { mapPostResponse } from './postUtil'
import { mapUserTokenResponse } from './userTokenUtil'

export function mapBountyResponse(bountyDoc: any): any {
  if (!bountyDoc) {
    return null
  }

  return {
    contractAddress: bountyDoc.contractAddress,
    bountyID: bountyDoc.bountyID,
    tokenID: bountyDoc.tokenID,
    userToken: mapUserTokenResponse(bountyDoc.userToken),
    userAddress: bountyDoc.userAddress,
    depositorToken: mapUserTokenResponse(bountyDoc.depositorToken),
    depositorAddress: bountyDoc.depositorAddress,
    token: bountyDoc.token,
    amount: bountyDoc.amount,
    status: bountyDoc.status,
    postedAt: bountyDoc.postedAt,
    post: mapPostResponse(bountyDoc.post),
  }
}

export function bountyOrderByCompareFn(
  a: any,
  b: any,
  orderBy: string,
  orderDirection: string
) {
  const value = a[orderBy] < b[orderBy] ? -1 : a[orderBy] > b[orderBy] ? 1 : 0
  return orderDirection === 'asc' ? value : -1 * value
}

export function areBountiesInSameGroup(b1: any, b2: any) {
  return (
    b1.tokenID === b2.tokenID &&
    b1.userAddress === b2.userAddress &&
    b1.token === b2.token
  )
}
