import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { TriggerType } from '../models/trigger.model'
import { addNewTrigger, resolveAllTriggers } from '../services/trigger.service'

export async function addTrigger(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const { type, triggerData } = reqBody

    const trigger = await addNewTrigger({
      type: type as TriggerType,
      triggerData,
    })

    return handleSuccess(res, { trigger })
  } catch (error) {
    console.error('Error occurred while adding new trigger', error)
    return handleError(res, error, 'Unable to add the trigger')
  }
}

export async function resolveTriggers(req: Request, res: Response) {
  try {
    await resolveAllTriggers()

    return handleSuccess(res, { message: `Triggers have been resolved` })
  } catch (error) {
    console.error('Error occurred while adding new trigger', error)
    return handleError(res, error, 'Unable to add the trigger')
  }
}
