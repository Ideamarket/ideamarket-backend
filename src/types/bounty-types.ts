import type { BountyStatus } from '../models/bounty-model'
import type { UserTokenResponse } from './user-token.types'

export type Web3Bounty = {
  bountyID: number
  tokenID: number
  user: string
  depositer: string
  token: string
  amount: number
  status: BountyStatus
  timestamp: string
}

export type BountyQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof BountyResponse
  orderDirection: string
  tokenID: number | null
  userTokenId: string | null
  username: string | null
  userAddress: string | null
  depositerTokenId: string | null
  depositerUsername: string | null
  depositerAddress: string | null
  status: BountyStatus | null
  startDate: Date | null
  endDate: Date | null
}

export type BountyResponse = {
  contractAddress: string
  bountyID: number
  tokenID: number
  userToken: UserTokenResponse | null
  depositerToken: UserTokenResponse | null
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
}
