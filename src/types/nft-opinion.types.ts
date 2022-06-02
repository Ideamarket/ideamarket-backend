import type { Citation } from '../models/nft-opinion.model'

export type Web3NFTOpinionData = {
  contractAddress: string
  tokenID: number
  author: string
  timestamp: string
  rating: string
  comment: string | null
  citations: Citation[]
}

export type NFTOpinion = {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string | null
  citations: Citation[]
}
