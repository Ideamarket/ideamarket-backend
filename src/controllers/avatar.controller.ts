import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import { getLambdaAvatar } from '../services/avatar.service'

export async function fetchAvatar(req: Request, res: Response) {
  try {
    const { provider, value } = req.query

    const lambdaAvatarResponse = await getLambdaAvatar(
      provider as string,
      value as string
    )

    return handleSuccess(res, lambdaAvatarResponse)
  } catch (error) {
    return handleError(res, error, 'Unable to fetch avatar')
  }
}
