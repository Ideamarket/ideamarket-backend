export type UserTokenResponse = {
  id: string
  walletAddress: string
  name: string | null
  username: string | null
  twitterUsername: string | null
  email: string | null
  bio: string | null
  profilePhoto: string | null
  role: string
  tokenAddress: string | null
  marketId: number
  marketName: string | null
  tokenOwner: string | null
  price: number
  dayChange: number
  weekChange: number
  deposits: number
  holders: number
  yearIncome: number
  claimableIncome: number
}

export type UserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserTokenResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}
