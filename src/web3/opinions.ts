import { getOpinionBaseContract } from './contract'

/**
 * Get all ratings/opinions that are onchain (includes past ratings from users).
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getAllOpinionsAboutAddress(idtAddress: string) {
  const opinionBaseContract = getOpinionBaseContract()
  return opinionBaseContract.methods.getOpinionsAboutAddress(idtAddress).call()
}

/**
 * Get latest ratings/opinions that are onchain (doesn't include past ratings from users, just most recent).
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getLatestOpinionsAboutAddress(idtAddress: string) {
  const opinionBaseContract = getOpinionBaseContract()
  return opinionBaseContract.methods
    .getLatestOpinionsAboutAddress(idtAddress)
    .call()
}

/**
 * Get the opinions data of an IDT address
 * @param idtAddress -- address of IDT that has been rated
 */
export async function getOpinionsData(idtAddress: string) {
  const allOpinions = await getAllOpinionsAboutAddress(idtAddress)
  const latestOpinions = await getLatestOpinionsAboutAddress(idtAddress)

  const averageRating = calculateAverageRating(latestOpinions)
  const totalOpinions = allOpinions?.length ?? 0
  const totalLatestOpinions = latestOpinions?.length ?? 0
  const totalComments = calculateTotalNumberOfComments(allOpinions)
  const totalLatestComments = calculateTotalNumberOfComments(latestOpinions)

  return {
    averageRating,
    totalOpinions,
    totalLatestOpinions,
    totalComments,
    totalLatestComments,
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
export async function getAverageRatingForIDT(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsAboutAddress(idtAddress)
  return calculateAverageRating(latestOpinions)
}

/**
 * Get total number of opinions for an idt address
 */
export async function getTotalNumberOfOpinions(idtAddress: string) {
  const allOpinions = await getAllOpinionsAboutAddress(idtAddress)
  return allOpinions?.length ?? 0
}

/**
 * Get total number of raters (total # opinions, not including duplicates by users)
 */
export async function getTotalNumberOfLatestOpinions(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsAboutAddress(idtAddress)
  return latestOpinions?.length ?? 0
}

/**
 * Get total number of comments from all the opinions
 */
export async function getTotalNumberOfComments(idtAddress: string) {
  const allOpinions = await getAllOpinionsAboutAddress(idtAddress)
  const opinionsWithComments = allOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return opinionsWithComments?.length
}

/**
 * Get total number of comments from all the latest opinions
 */
export async function getTotalNumberOfLatestComments(idtAddress: string) {
  const latestOpinions = await getLatestOpinionsAboutAddress(idtAddress)
  const latestOpinionsWithComments = latestOpinions.filter(
    (opinion: any) => opinion?.comment?.length > 0
  )

  return latestOpinionsWithComments?.length
}
