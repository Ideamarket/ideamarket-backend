import type {
  EarliestPricePoint,
  LatestPricePoint,
  Market,
  PricePoint,
} from './subgraph.types'

export type ListingResponse = {
  web2TokenData: Web2TokenData | Partial<Web2TokenData> | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null
}

export type NewListingResponse = {
  listingId: string
  value: string
  marketId: number
  marketName: string
  categories: Category[]
  isOnchain: boolean
  ghostListedBy: string | null
  ghostListedAt: Date | null
  onchainValue: string | null
  onchainId: string | null
  onchainListedBy: string | null
  onchainListedAt: Date | null
  totalVotes: number
  onchainOwner: string
  price: number
  dayChange: number
  weekChange: number
  deposits: number
  holders: number
  yearIncome: number
  claimableIncome: number
  verified: boolean | null
  averageRating: number
  latestRatingsCount: number
  latestCommentsCount: number
  upVoted: boolean | null
  web3TokenData: Web3TokenData | Partial<Web3TokenData> | null
}

export type Category = {
  id: string
  name: string
}

export type Web2TokenData = {
  listingId: string
  value: string
  marketId: number
  marketName: string
  isOnchain: boolean
  ghostListedBy: string | null
  ghostListedAt: Date | null
  onchainValue: string | null
  onchainId: string | null
  onchainListedBy: string | null
  onchainListedAt: Date | null
  totalVotes: number
  upVoted: boolean | null
}

export type OnchainTokens = {
  ideaTokens: Web3TokenData[]
  tokenNameSearch: Web3TokenData[]
}

export type Web3TokenData = {
  daiInToken: string
  dayChange: string
  dayVolume: string
  earliestPricePoint: EarliestPricePoint[]
  holders: number
  id: string
  invested: string
  latestPricePoint: LatestPricePoint
  listedAt: string
  lockedAmount: string
  lockedPercentage: string
  market: Market
  marketCap: string
  name: string
  pricePoints: PricePoint[]
  rank: number
  supply: string
  tokenID: number
  lister: string
  tokenOwner: string
}

export type BlacklistedListingResponse = {
  listingId: string
  blacklistedBy: string | null
  blacklistedAt: Date
}
