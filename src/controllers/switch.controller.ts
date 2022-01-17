import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import type { ISwitch } from '../models/switch.model'
import {
  addSwitchInDB,
  deleteSwitchFromDB,
  fetchSwitchFromDB,
  updateSwitchInDB,
} from '../services/switch.service'

export async function addSwitch(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const switchRequest: ISwitch = {
      feature: reqBody.feature as string,
      enabled: reqBody.enabled ? (reqBody.enabled as boolean) : false,
    }

    const switchAdded = await addSwitchInDB(switchRequest)

    return handleSuccess(res, switchAdded)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to add the switch')
  }
}

export async function updateSwitch(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const switchRequest: ISwitch = {
      feature: reqBody.feature as string,
      enabled: reqBody.enabled as boolean,
    }

    const switchUpdated = await updateSwitchInDB(switchRequest)

    return handleSuccess(res, switchUpdated)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to update the switch')
  }
}

export async function fetchSwitch(req: Request, res: Response) {
  try {
    const feature = req.query.value as string

    const switchFetched = await fetchSwitchFromDB(feature)

    return handleSuccess(res, switchFetched)
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to fetch the switch')
  }
}

export async function deleteSwitch(req: Request, res: Response) {
  try {
    const feature = req.query.value as string

    await deleteSwitchFromDB(feature)

    return handleSuccess(res, {})
  } catch (error) {
    console.error(error)
    return handleError(res, error, 'Unable to delete the switch')
  }
}
