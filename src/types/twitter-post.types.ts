import type { UserTokenResponse } from './user-token.types'

export type Web3IdeamarketPost = {
  tokenID: number
  minter: string
  content: string
  timestamp: string
  categories: string[]
  imageLink: string
  isURL: boolean
  urlContent: string
}

export type TwitterPostQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof TwitterPostResponse
  orderDirection: string
  twitterUsername: string | null
  search: string | null
  categories: string[]
  filterTokens: string[]
  startDate: Date | null
  endDate: Date | null
}

export type TwitterPostCitationsQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof TwitterPostResponse
  orderDirection: string
}

export type TwitterPostCitedByQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof TwitterPostResponse
  orderDirection: string
}

export type TwitterCitationResponse = {
  citation: TwitterCitationPost | null
  inFavor: boolean
}

export type TwitterCitationPost = {
  postId: string
  tokenID: number
  content: string
  compositeRating: number
  totalRatingsCount: number
  latestRatingsCount: number
  minterToken: {
    id: string
    walletAddress: string
    username: string | null
    profilePhoto: string | null
  } | null
}

export type TwitterCitationTokenIds = {
  forCitationsTokenIds: number[]
  againstCitationsTokenIds: number[]
} | null

export type TwitterPostRequest = {
  postID: string
  twitterUsername: string
  content: string
  categories: string[]
}

export type TwitterPostResponse = {
  postID: string
  twitterUsername: string
  content: string
  postedAt: Date | null
  categories: string[]
  averageRating: number
  compositeRating: number
  marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
  minterToken: UserTokenResponse | null
  topCitations: TwitterPostResponse[]
  topRatings: any[]
  isPostInFavorOfParent: boolean
}

export type TwitterPostOpinionsQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof TwitterPostOpinionWithPostResponse
  orderDirection: string
  search: string | null
  filterTokens: number[]
}

export type TwitterPostOpinionsResponse = {
  contractAddress: string
  tokenID: number
  opinions: TwitterPostOpinion[]
}

export type TwitterPostOpinion = {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string | null
  citations: TwitterCitationResponse[]
  userToken: UserTokenResponse | null
}

export type TwitterPostOpinionWithPostResponse = {
  contractAddress: string
  tokenID: number
  twitterUsername: string | null
  content: string | null
  postedAt: Date | null
  categories: string[]
  imageLink: string | null
  isURL: boolean | null
  urlContent: string | null
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string | null
  citations: TwitterCitationResponse[]
  averageRating: number
  compositeRating: number
  marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
  deposits?: number
  minterToken: UserTokenResponse | null
}
