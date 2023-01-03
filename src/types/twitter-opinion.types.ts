import type { TwitterPostResponse } from './twitter-post.types'
import type { TwitterUserTokenResponse } from './twitter-user-token.types'

export type TwitterOpinionQueryOptions = {
  latest: boolean
  skip: number
  limit: number
  orderBy: keyof TwitterOpinionResponse
  orderDirection: string
  ratedBy: string | null
  ratedPostID: string | null
  search: string | null
}

export type TwitterOpinionRequest = {
  ratedPostID: string
  ratedBy: string
  rating: number
  citations: TwitterCitation[]
}

export type TwitterOpinionResponse = {
  opinionID: string
  ratedPostID: string
  ratedBy: string
  ratedAt: Date
  rating: number
  citations: TwitterCitationResponse[]
  userToken: TwitterUserTokenResponse | null

  content?: string
}

export type TwitterCitation = {
  postID: string
  inFavor: boolean
}

export type TwitterCitationResponse = {
  citation: TwitterPostResponse | null
  inFavor: boolean
}
