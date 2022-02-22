export type IdeaTokens = {
  ideaTokens: IdeaToken[]
}

export type IdeaToken = {
  id: string
  name: string
  market: Market
  dayChange: string
  marketCap: string
  latestPricePoint: LatestPricePoint
  holders: number
  pricePoints: PricePoint[]
  lister: string
  listedAt: string
  tokenOwner: string
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

export type SubgraphTokenInfoQueryResult = {
  tokenName: string
  tokenOwner: string
  marketName: string
}
