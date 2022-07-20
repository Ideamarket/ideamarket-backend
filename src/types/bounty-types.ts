import type { BountyStatus } from '../models/bounty-model'
import type { UserTokenResponse } from './user-token.types'

export type Web3Bounty = {
  bountyID: number
  tokenID: number
  user: string
  depositor: string
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
  depositorTokenId: string | null
  depositorUsername: string | null
  depositorAddress: string | null
  filterStatuses: string[] // string of comma separated statuses. All other statuses are filtered out
  startDate: Date | null
  endDate: Date | null
}

export type BountyResponse = {
  contractAddress: string
  bountyID: number
  tokenID: number
  userToken: UserTokenResponse | null
  depositorToken: UserTokenResponse | null
  token: string
  amount: number
  status: BountyStatus
  postedAt: Date
}
