import type { TriggerDocument } from '../models/trigger.model'
import type { TriggerResponse } from '../types/trigger.types'

export function mapTriggerResponse(
  triggerDoc: TriggerDocument | null
): TriggerResponse | null {
  if (!triggerDoc) {
    return null
  }

  return {
    type: triggerDoc.type,
    triggerData: triggerDoc.triggerData,
  }
}
