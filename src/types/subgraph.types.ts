export type IdeaTokens = {
  ideaTokens: IdeaToken[]
}

export type IdeaToken = {
  id: string
  name: string
  market: Market
  tokenOwner: string
  listedAt: string
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
