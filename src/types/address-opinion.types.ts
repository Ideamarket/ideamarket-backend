export type Web3AddressOpinionData = {
  addy: string
  author: string
  timestamp: string
  rating: string
  comment: string
}

export type AddressOpinionQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof AddressOpinionWithSummaryResponse
  orderDirection: string
  filterTokens: string[]
}

export type AddressOpinionResponse = {
  tokenAddress: string
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}

export type AddressOpinionsSummaryResponse = {
  tokenAddress: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}

export type AddressOpinionWithSummaryResponse = {
  tokenAddress: string
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
  averageRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
}
