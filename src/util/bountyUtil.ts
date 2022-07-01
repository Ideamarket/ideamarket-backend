import type { BountyDocument } from '../models/bounty-model'
import type { BountyResponse } from '../types/bounty-types'
import { mapUserTokenResponse } from './userTokenUtil'

export function mapBountyResponse(
  bountyDoc: BountyDocument | null
): BountyResponse | null {
  if (!bountyDoc) {
    return null
  }

  return {
    contractAddress: bountyDoc.contractAddress,
    bountyID: bountyDoc.bountyID,
    tokenID: bountyDoc.tokenID,
    userToken: mapUserTokenResponse(bountyDoc.userToken),
    depositerToken: mapUserTokenResponse(bountyDoc.depositerToken),
    token: bountyDoc.token,
    amount: bountyDoc.amount,
    status: bountyDoc.status,
    postedAt: bountyDoc.postedAt,
  }
}
