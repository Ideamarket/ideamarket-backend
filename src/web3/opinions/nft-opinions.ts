/* eslint-disable no-await-in-loop */
import type { EventData } from 'web3-eth-contract'

import type { Citation } from '../../models/nft-opinion.model'
import { getNFTOpinionsContract } from '../contract'

export type Opinion = {
  tokenID: number
  author: string
  blockHeight: string
  rating: string
  comment: string | null
  citations: Citation[]
}

export async function getPastEvents({
  startBlock,
  endBlock,
}: {
  startBlock: number
  endBlock: number
}) {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  let allEvents: EventData[] = []

  const originalStepSize = 100_000
  let stepSize = originalStepSize
  let currentBlock = startBlock

  while (currentBlock <= endBlock) {
    let iterationEndBlock = currentBlock + stepSize
    if (iterationEndBlock > endBlock) {
      iterationEndBlock = endBlock
    }

    let events: EventData[] = []
    try {
      console.log(
        `Fetching NewOpinion events from ${currentBlock} block to ${iterationEndBlock} block`
      )
      events = await nftOpinionBaseContract.getPastEvents('NewOpinion', {
        fromBlock: currentBlock,
        toBlock: iterationEndBlock,
      })
      console.log(
        `Number of events found from ${currentBlock} block to ${iterationEndBlock} block = ${events.length}`
      )
      console.log({ events })
    } catch (error) {
      console.error(
        'Too many events in this range, decreasing the range by half',
        error
      )
      stepSize = Math.floor(stepSize / 2)
      continue
    }

    allEvents = [...allEvents, ...events]
    currentBlock = iterationEndBlock + 1
    stepSize = originalStepSize
  }

  return allEvents
}

/**
 * Get all opinions of all the NFTs
 */
export async function getAllNFTsOpinions(): Promise<Opinion[]> {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  const allOpinions = await nftOpinionBaseContract.methods
    .getAllOpinions()
    .call()

  return (allOpinions as any[]).map((opinion: any) => convertOpinion(opinion))
}

/**
 * Get all the opinioned NFTs
 */
export async function getAllOpinionedNFTs() {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods.getOpinionedNFTs().call()
}

/**
 * Get all opinions of an NFT (includes past ratings from users).
 * @param tokenID -- tokenID of the NFT
 */
export async function getAllOpinionsOfNFT(tokenID: number): Promise<Opinion[]> {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  const allOpinions = await nftOpinionBaseContract.methods
    .getOpinionsAboutNFT(tokenID)
    .call()

  return (allOpinions as any[]).map((opinion: any) => convertOpinion(opinion))
}

/**
 * Get latest opinions of an NFT
 * (doesn't include past ratings from users, just most recent).
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestOpinionsOfNFT(
  tokenID: number
): Promise<Opinion[]> {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  const latestOpinions = await nftOpinionBaseContract.methods
    .getLatestOpinionsAboutNFT(tokenID)
    .call()

  return (latestOpinions as any[]).map((opinion: any) =>
    convertOpinion(opinion)
  )
}

/**
 * Get the opinions data of an NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getOpinionsSummaryOfNFT(tokenID: number) {
  const allOpinions = await getAllOpinionsOfNFT(tokenID)
  const latestOpinions = await getLatestOpinionsOfNFT(tokenID)

  const averageRating = calculateAverageRating(latestOpinions)
  const totalRatingsCount = allOpinions.length
  const latestRatingsCount = latestOpinions.length
  const totalCommentsCount = calculateTotalNumberOfComments(allOpinions)
  const latestCommentsCount = calculateTotalNumberOfComments(latestOpinions)

  return {
    allOpinions,
    latestOpinions,
    averageRating,
    totalRatingsCount,
    latestRatingsCount,
    totalCommentsCount,
    latestCommentsCount,
  }
}

/**
 * Calculate average rating from the opinions
 */
function calculateAverageRating(opinions: any[]) {
  const ratings: number[] | undefined = opinions.map((opinion: any) =>
    Number(opinion.rating)
  )
  if (ratings.length <= 0) {
    return 0
  }
  return ratings.reduce((a, b) => a + b, 0) / ratings.length
}

/**
 * Calculate total number of comments from the opinions
 */
function calculateTotalNumberOfComments(opinions: any[]) {
  const opinionsWithComments = opinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )
  return opinionsWithComments.length
}

/**
 * Get the average rating of an NFT from all latest ratings
 * @param tokenID -- tokenID of the NFT
 */
export async function getAverageRatingOfNFT(tokenID: number) {
  const latestOpinions = await getLatestOpinionsOfNFT(tokenID)
  return calculateAverageRating(latestOpinions)
}

/**
 * Get total number of opinions for an NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getTotalOpinionsCountOfNFT(tokenID: number) {
  const allOpinions = await getAllOpinionsOfNFT(tokenID)
  return allOpinions.length
}

/**
 * Get total number of raters of an NFT (total # opinions, not including duplicates by users)
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestOpinionsCountOfNFT(tokenID: number) {
  const latestOpinions = await getLatestOpinionsOfNFT(tokenID)
  return latestOpinions.length
}

/**
 * Get total number of comments of an NFT from all the opinions
 * @param tokenID -- tokenID of the NFT
 */
export async function getTotalCommentsCountOfNFT(tokenID: number) {
  const allOpinions = await getAllOpinionsOfNFT(tokenID)
  const opinionsWithComments = allOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return opinionsWithComments.length
}

/**
 * Get total number of comments of an NFT from all the latest opinions
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestCommentsCountOfNFT(tokenID: number) {
  const latestOpinions = await getLatestOpinionsOfNFT(tokenID)
  const latestOpinionsWithComments = latestOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return latestOpinionsWithComments.length
}

function convertOpinion(opinion: any): Opinion {
  const citationsArr = opinion.citations as number[]
  const inFavorArr = opinion.inFavorArr as boolean[]

  const citations: Citation[] = []
  for (let i = 0; i < citationsArr.length; i++) {
    citations.push({ tokenID: citationsArr[i], inFavor: inFavorArr[i] })
  }

  return {
    tokenID: opinion.tokenID,
    author: opinion.author as string,
    blockHeight: opinion.blockHeight,
    rating: opinion.rating,
    comment: null,
    citations,
  }
}
