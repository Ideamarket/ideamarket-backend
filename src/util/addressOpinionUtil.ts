import type { AddressOpinionDocument } from '../models/address-opinion.model'
import type { AddressOpinionsSummaryDocument } from '../models/address-opinions-summary.model'
import type {
  AddressOpinionResponse,
  AddressOpinionsSummaryResponse,
  AddressOpinionWithSummaryResponse,
} from '../types/address-opinion.types'

export function mapOpinionResponse(
  addressOpinionDoc: AddressOpinionDocument | null
): AddressOpinionResponse | null {
  if (!addressOpinionDoc) {
    return null
  }

  return {
    tokenAddress: addressOpinionDoc.tokenAddress,
    ratedBy: addressOpinionDoc.ratedBy,
    ratedAt: addressOpinionDoc.ratedAt,
    rating: addressOpinionDoc.rating,
    comment: addressOpinionDoc.comment,
  }
}

export function mapOpinionsSummaryResponse(
  addressOpinionsSummaryDoc: AddressOpinionsSummaryDocument | null
): AddressOpinionsSummaryResponse | null {
  if (!addressOpinionsSummaryDoc) {
    return null
  }

  return {
    tokenAddress: addressOpinionsSummaryDoc.tokenAddress,
    averageRating: addressOpinionsSummaryDoc.averageRating,
    totalRatingsCount: addressOpinionsSummaryDoc.totalRatingsCount,
    latestRatingsCount: addressOpinionsSummaryDoc.latestRatingsCount,
    totalCommentsCount: addressOpinionsSummaryDoc.totalCommentsCount,
    latestCommentsCount: addressOpinionsSummaryDoc.latestCommentsCount,
  }
}

export function mapOpinionWithSummaryResponse({
  addressOpinion,
  addressOpinionsSummary,
}: {
  addressOpinion: AddressOpinionDocument | null
  addressOpinionsSummary: AddressOpinionsSummaryDocument | null
}): AddressOpinionWithSummaryResponse | null {
  if (!addressOpinion) {
    return null
  }

  return {
    tokenAddress: addressOpinion.tokenAddress,
    ratedBy: addressOpinion.ratedBy,
    ratedAt: addressOpinion.ratedAt,
    rating: addressOpinion.rating,
    comment: addressOpinion.comment,
    averageRating: addressOpinionsSummary?.averageRating ?? 0,
    totalRatingsCount: addressOpinionsSummary?.totalRatingsCount ?? 0,
    latestRatingsCount: addressOpinionsSummary?.latestRatingsCount ?? 0,
    totalCommentsCount: addressOpinionsSummary?.totalCommentsCount ?? 0,
    latestCommentsCount: addressOpinionsSummary?.latestCommentsCount ?? 0,
  }
}
