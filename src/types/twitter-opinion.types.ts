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
  citations: TwitterOpinionResponse[]
}

export type TwitterCitation = {
  ratedPostID: number
  inFavor: boolean
}
