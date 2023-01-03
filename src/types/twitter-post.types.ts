import type mongoose from 'mongoose'

import type { TwitterUserTokenResponse } from './twitter-user-token.types'

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

export type TwitterCitationPostIds = {
  forCitationsPostIds: mongoose.Types.ObjectId[]
  againstCitationsPostIds: mongoose.Types.ObjectId[]
} | null

export type TwitterPostRequest = {
  postID: string
  twitterUsername: string
  content: string
  categories: string[]
}

export type TwitterPostResponse = {
  postID: string
  content: string
  postedAt: Date | null
  // categories: string[]
  averageRating: number
  // compositeRating: number
  // marketInterest: number
  totalRatingsCount: number
  latestRatingsCount: number
  userToken: TwitterUserTokenResponse | null
  topCitations: TwitterPostResponse[]
  topRatings: any[]
  isPostInFavorOfParent: boolean
}
