import { getNFTOpinionsContract } from '../contract'

/**
 * Get all opinions of all the NFTs
 */
export async function getAllNFTsOpinions() {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods.getAllOpinions().call()
}

/**
 * Get all the opinioned NFTs
 */
export async function getAllOpinionedNFTs() {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods.getOpinionedNFTs().call()
}

/**
 * Get all opinions of all the NFTs that belong to a single contract address
 */
export async function getAllNFTsOpinionsOfAddress(contractAddress: string) {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods
    .getAllOpinionsForAddress(contractAddress)
    .call()
}

/**
 * Get all the opinioned NFTs that belong to a single contract address
 */
export async function getAllOpinionedNFTsOfAddress(contractAddress: string) {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods
    .getOpinionedNFTsForAddress(contractAddress)
    .call()
}

/**
 * Get all opinions of an NFT (includes past ratings from users).
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getAllOpinionsOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods
    .getOpinionsAboutNFT(contractAddress, tokenID)
    .call()
}

/**
 * Get latest opinions of an NFT
 * (doesn't include past ratings from users, just most recent).
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestOpinionsOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const nftOpinionBaseContract = getNFTOpinionsContract()
  return nftOpinionBaseContract.methods
    .getLatestOpinionsAboutNFT(contractAddress, tokenID)
    .call()
}

/**
 * Get the opinions data of an NFT
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getOpinionsSummaryOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const allOpinions = await getAllOpinionsOfNFT({ contractAddress, tokenID })
  const latestOpinions = await getLatestOpinionsOfNFT({
    contractAddress,
    tokenID,
  })

  const averageRating = calculateAverageRating(latestOpinions)
  const totalRatingsCount = allOpinions?.length ?? 0
  const latestRatingsCount = latestOpinions?.length ?? 0
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
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getAverageRatingOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const latestOpinions = await getLatestOpinionsOfNFT({
    contractAddress,
    tokenID,
  })
  return calculateAverageRating(latestOpinions)
}

/**
 * Get total number of opinions for an NFT
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getTotalOpinionsCountOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const allOpinions = await getAllOpinionsOfNFT({ contractAddress, tokenID })
  return allOpinions?.length ?? 0
}

/**
 * Get total number of raters of an NFT (total # opinions, not including duplicates by users)
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestOpinionsCountOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const latestOpinions = await getLatestOpinionsOfNFT({
    contractAddress,
    tokenID,
  })
  return latestOpinions?.length ?? 0
}

/**
 * Get total number of comments of an NFT from all the opinions
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getTotalCommentsCountOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const allOpinions = await getAllOpinionsOfNFT({ contractAddress, tokenID })
  const opinionsWithComments = allOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return opinionsWithComments?.length
}

/**
 * Get total number of comments of an NFT from all the latest opinions
 * @param contractAddress -- contract address of the NFT
 * @param tokenID -- tokenID of the NFT
 */
export async function getLatestCommentsCountOfNFT({
  contractAddress,
  tokenID,
}: {
  contractAddress: string
  tokenID: number
}) {
  const latestOpinions = await getLatestOpinionsOfNFT({
    contractAddress,
    tokenID,
  })
  const latestOpinionsWithComments = latestOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return latestOpinionsWithComments?.length
}
