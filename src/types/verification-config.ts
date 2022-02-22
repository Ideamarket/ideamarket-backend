export type TwitterConfig = {
  apiKey: string
  apiSecret: string
  bearer: string
}

export type TwitchConfig = {
  clientID: string
  clientSecret: string
}

export type MarketConfig = {
  chain: string
  enabled: boolean
  feeEnabled: boolean
  skipVerification: boolean
}
