import { getAddressOpinionsContract } from '../contract'

/**
 * Get all opinions of all the addresses
 */
export async function getAllOpinionsOfAllAddresses() {
  const addressOpinionBaseContract = getAddressOpinionsContract()
  return addressOpinionBaseContract.methods.getAllOpinions().call()
}

/**
 * Get all the opinioned addresses
 */
export async function getAllOpinionedAddresses() {
  const addressOpinionBaseContract = getAddressOpinionsContract()
  return addressOpinionBaseContract.methods.getOpinionedAddresses().call()
}

/**
 * Get all opinions of a particular address (includes past ratings from users).
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getAllOpinionsOfAddress(idtAddress: string) {
  const addressOpinionBaseContract = getAddressOpinionsContract()
  return addressOpinionBaseContract.methods
    .getOpinionsAboutAddress(idtAddress)
    .call()
}

/**
 * Get latest opinions of a particular address
 * (doesn't include past ratings from users, just most recent).
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getLatestOpinionsOfAddress(idtAddress: string) {
  const addressOpinionBaseContract = getAddressOpinionsContract()
  return addressOpinionBaseContract.methods
    .getLatestOpinionsAboutAddress(idtAddress)
    .call()
}

/**
 * Get the opinions data of an IDT address
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getOpinionsDataOfAddress(idtAddress: string) {
  const allOpinions = await getAllOpinionsOfAddress(idtAddress)
  const latestOpinions = await getLatestOpinionsOfAddress(idtAddress)

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
 * Get the average rating of all ratings onchain for this IDT
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getAverageRatingOfAddress(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsOfAddress(idtAddress)
  return calculateAverageRating(latestOpinions)
}

/**
 * Get total number of opinions for an idt address
 */
export async function getTotalOpinionsCountOfAddress(idtAddress: string) {
  const allOpinions = await getAllOpinionsOfAddress(idtAddress)
  return allOpinions?.length ?? 0
}

/**
 * Get total number of raters (total # opinions, not including duplicates by users)
 */
export async function getLatestOpinionsCountOfAddress(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsOfAddress(idtAddress)
  return latestOpinions?.length ?? 0
}

/**
 * Get total number of comments from all the opinions
 */
export async function getTotalCommentsCountOfAddress(idtAddress: string) {
  const allOpinions = await getAllOpinionsOfAddress(idtAddress)
  const opinionsWithComments = allOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return opinionsWithComments?.length
}

/**
 * Get total number of comments from all the latest opinions
 */
export async function getLatestCommentsCountOfAddress(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsOfAddress(idtAddress)
  const latestOpinionsWithComments = latestOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return latestOpinionsWithComments?.length
}
