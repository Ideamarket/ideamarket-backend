import type { ISwitch } from '../models/switch.model'
import { SwitchModel } from '../models/switch.model'
import type { SwitchResponse } from '../types/switch.types'
import { mapSwitch } from '../util/switchUtil'

export async function addSwitchInDB(switchRequest: ISwitch) {
  const switchDoc = SwitchModel.build({
    feature: switchRequest.feature,
    enabled: switchRequest.enabled,
  })

  const createdSwitch = await SwitchModel.create(switchDoc)
  return mapSwitch(createdSwitch)
}

export async function updateSwitchInDB(switchRequest: ISwitch) {
  const switchDoc = await SwitchModel.findOne({
    feature: switchRequest.feature,
  })
  if (!switchDoc) {
    throw new Error('Switch do not exist')
  }

  switchDoc.enabled = switchRequest.enabled

  const updatedSwitchDoc = await switchDoc.save()
  return mapSwitch(updatedSwitchDoc)
}

export async function fetchSwitchFromDB(feature: string) {
  const switchDoc = await SwitchModel.findOne({ feature })
  if (!switchDoc) {
    console.log('Switch do not exist, returning default response')
    const switchResponse: SwitchResponse = { feature, enabled: true }
    return switchResponse
  }

  return mapSwitch(switchDoc)
}

export async function deleteSwitchFromDB(feature: string) {
  const switchDoc = await SwitchModel.findOne({ feature })
  if (!switchDoc) {
    console.log('Switch do not exist to delete')
    return Promise.resolve()
  }

  return SwitchModel.deleteOne({ feature })
}
