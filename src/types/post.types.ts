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

export type PostQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof PostResponse
  orderDirection: string
  minterAddress: string | null
  search: string | null
  categories: string[]
  filterTokens: string[]
  startDate: Date | null
  endDate: Date | null
}

export type PostCitationsQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof PostResponse
  orderDirection: string
}

export type PostCitedByQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof PostResponse
  orderDirection: string
}

export type CitationResponse = {
  citation: CitationPost | null
  inFavor: boolean
}

export type CitationPost = {
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

export type PostResponse = {
  id: string
  contractAddress: string
  tokenID: number
  minterAddress: string
  content: string
  postedAt: Date | null
  categories: string[]
  imageLink: string
  isURL: boolean
  urlContent: string
  averageRating: number
  compositeRating: number
  marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
  totalCommentsCount: number
  latestCommentsCount: number
  minterToken: UserTokenResponse | null
  topCitations: PostResponse[]
  topRatings: any[]
}

export type PostOpinionsQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof PostOpinionWithPostResponse
  orderDirection: string
  search: string | null
  filterTokens: number[]
}

export type PostOpinionsResponse = {
  contractAddress: string
  tokenID: number
  opinions: PostOpinion[]
}

export type PostOpinion = {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string | null
  citations: CitationResponse[]
  userToken: UserTokenResponse | null
}

export type PostOpinionWithPostResponse = {
  contractAddress: string
  tokenID: number
  minterAddress: string | null
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
  citations: CitationResponse[]
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
