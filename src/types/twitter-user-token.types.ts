export type TwitterUserTokenRequest = {
  id: string
  twitterUsername: string | null
}

export type TwitterUserTokenResponse = {
  id: string
  twitterUserId: string | null
  twitterUsername: string | null
  twitterProfilePicURL: string | null
}

export type TwitterUserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof TwitterUserTokenResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}

export type TwitterLoginInitiation = {
  authorizationUrl?: string
}

export type TwitterLoginCompletion = {
  twitterJwt: string
  validUntil: Date
  // userTokenCreated: boolean
  twitterUserToken: TwitterUserTokenResponse | null
}
