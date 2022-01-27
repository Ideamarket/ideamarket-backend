type EarliestPricePoint = {
  counter: number
  oldPrice: string
  price: string
  timestamp: string
}

type LatestPricePoint = {
  counter: number
  oldPrice: string
  price: string
  timestamp: string
}

type Market = {
  id: number
  name: string
}

type PricePoint = {
  oldPrice: string
  price: string
}

export type IdeaToken = {
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
  tokenOwner: string
}

export type IdeaTokensSubgraphResult = {
  ideaTokens: IdeaToken[]
}
