import type BN from 'bn.js'

export type IdeaTokens = {
  ideaTokens: IdeaToken[]
}

export type IdeaToken = {
  id: string
  name: string
  market: Market
  dayChange: string
  marketCap: string
  balances: IdeaTokenBalance[]
  latestPricePoint: LatestPricePoint
  holders: number
  pricePoints: PricePoint[]
  lister: string
  listedAt: string
  tokenOwner: string
}

export type IdeaTokenBalance = {
  amount: string
  holder: string
}

export type EarliestPricePoint = {
  counter: number
  oldPrice: string
  price: string
  timestamp: string
}

export type LatestPricePoint = {
  counter: number
  oldPrice: string
  price: string
  timestamp: string
}

export type Market = {
  id: number
  name: string
}

export type PricePoint = {
  oldPrice: string
  price: string
}

export type IdeaMarket = {
  name: string
  marketID: number
  baseCost: string
  rawBaseCost: BN
  priceRise: string
  rawPriceRise: BN
  hatchTokens: string
  rawHatchTokens: BN
  tradingFeeRate: string
  rawTradingFeeRate: BN
  platformFeeInvested: string
  rawPlatformFeeInvested: BN
  platformFeeRate: string
  rawPlatformFeeRate: BN
  platformOwner: string
  platformInterestRedeemed: string
  rawPlatformInterestRedeemed: BN
  platformFeeRedeemed: string
  rawPlatformFeeRedeemed: BN
  nameVerifierAddress: string
}

export type IdeaMarketTokenPricePoint = {
  timestamp: number
  counter: number
  oldPrice: number
  price: number
}

export type IdeaMarketToken = {
  address: string
  marketID: number
  marketName: string
  tokenID: number
  listingId: string
  name: string
  supply: string
  rawSupply: BN
  holders: number
  marketCap: string
  rawMarketCap: BN
  rank: number
  tokenOwner: string
  daiInToken: string
  rawDaiInToken: BN
  invested: string
  rawInvested: BN
  tokenInterestRedeemed: string
  rawTokenInterestRedeemed: BN
  latestPricePoint: IdeaMarketTokenPricePoint
  earliestPricePoint: IdeaMarketTokenPricePoint
  dayChange: string
  weeklyChange: any
  dayVolume: string
  listedAt: number
  lockedAmount: string
  rawLockedAmount: BN
  lockedPercentage: string
  isL1: boolean
  holder: string
  isOnChain: boolean
  url: string
  verified: boolean
  upVoted: boolean
  totalVotes: number
  categories: string[]
}

export type IdeaTokenMarketPair = {
  listingId: string
  token: Partial<IdeaMarketToken>
  market: IdeaMarket
  rawBalance: BN | undefined
  balance: string | undefined
}

export type LockedIdeaTokenMarketPair = {
  listingId: string
  token: Partial<IdeaMarketToken>
  market: IdeaMarket
  rawBalance: BN | undefined
  balance: string | undefined
  lockedUntil: number
}

export type WalletHolding = {
  listingId: string
  token: Partial<IdeaMarketToken>
  market: Partial<IdeaMarket>
  rawBalance: BN | undefined
  balance: string | undefined
  lockedAmount?: string
}

export type IdeaTokenTrade = {
  listingId: string
  token: IdeaMarketToken
  isBuy: boolean
  timestamp: number
  rawIdeaTokenAmount: BN
  ideaTokenAmount: number
  rawDaiAmount: BN
  daiAmount: number
  market: IdeaMarket
}
