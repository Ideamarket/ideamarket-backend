import type { CompositeRatingDocument } from '../models/composite-rating-model'

export function mapCompositeRating(compositeRating: CompositeRatingDocument) {
  return {
    date: compositeRating.date,
    rating: compositeRating.rating,
    timestamp: compositeRating.timestamp,
  }
}
