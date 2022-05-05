import type { NFTOpinion } from './nft-opinion.types'
import type { UserTokenResponse } from './user-token.types'

export type Web3IdeamarketPost = {
  tokenID: number
  minter: string
  content: string
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
}

export type PostResponse = {
  contractAddress: string
  tokenID: number
  minterAddress: string
  content: string
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

export type PostOpinion = NFTOpinion & { userToken: UserTokenResponse | null }

export type PostOpinionWithPostResponse = {
  contractAddress: string
  tokenID: number
  minterAddress: string | null
  content: string | null
  categories: string[]
  imageLink: string | null
  isURL: boolean | null
  urlContent: string | null
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
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
