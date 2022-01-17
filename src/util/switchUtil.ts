import type { SwitchDocument } from '../models/switch.model'
import type { SwitchResponse } from '../types/switch.types'

export function mapSwitch(switchDoc: SwitchDocument): SwitchResponse {
  return {
    feature: switchDoc.feature,
    enabled: switchDoc.enabled,
  }
}
