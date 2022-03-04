import { TriggerModel, TriggerType } from '../models/trigger.model'
import { mapTriggerResponse } from '../util/triggerUtil'
import { BadRequestError, InternalServerError } from './errors'
import { resolveOnchainListingTriggers } from './listing.service'

export async function addNewTrigger({
  type,
  triggerData,
}: {
  type: TriggerType
  triggerData: any
}) {
  if (!validateTriggerData({ type, triggerData })) {
    throw new BadRequestError(`TriggerData is not valid for type=${type}`)
  }
  try {
    const triggerDoc = TriggerModel.build({ type, triggerData })
    const trigger = await TriggerModel.create(triggerDoc)

    return mapTriggerResponse(trigger)
  } catch (error) {
    console.error('Error occurred while adding new trigger', error)
    throw new InternalServerError('Failed to add new trigger')
  }
}

export async function resolveAllTriggers(type: string) {
  try {
    const triggers = await TriggerModel.find({ type })
    if (type === TriggerType.ONCHAIN_LISTING) {
      await resolveOnchainListingTriggers(triggers)
    }
  } catch (error) {
    console.error('Error occurred while resolving the triggers', error)
    throw new InternalServerError('Failed to resolve the triggers')
  }
}

function validateTriggerData({
  type,
  triggerData,
}: {
  type: string
  triggerData: any
}) {
  if (type === TriggerType.ONCHAIN_LISTING) {
    return (
      triggerData?.marketId && (triggerData.tokenId || triggerData.tokenName)
    )
  }
  return false
}
