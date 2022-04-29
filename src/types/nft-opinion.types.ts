export type Web3NFTOpinionData = {
  contractAddress: string
  tokenID: number
  author: string
  timestamp: string
  rating: string
  comment: string
}

export type NFTOpinion = {
  contractAddress: string
  tokenID: number
  ratedBy: string
  ratedAt: Date
  rating: number
  comment: string
}
