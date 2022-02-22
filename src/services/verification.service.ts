/* eslint-disable @typescript-eslint/no-throw-literal */
import { VerificationRequestModel } from '../models/verification-request.model'
import type { VerifiedTokenDocument } from '../models/verified-token.model'
import { VerifiedTokenModel } from '../models/verified-token.model'
import type { VerificationRequest } from '../types/verification-request'
import type { VerifiedToken } from '../types/verified-token'

export async function loadVerifiedTokenDB(
  tokenAddress: string,
  chain: string
): Promise<VerifiedTokenDocument | null> {
  return VerifiedTokenModel.findOne({ tokenAddress, chain })
}

export function insertVerificationRequestDB(model: VerificationRequest) {
  return VerificationRequestModel.create(model)
}

export function insertVerifiedTokenDB(model: VerifiedToken) {
  return VerifiedTokenModel.create(model)
}

export async function updateVerificationRequestDB(model: VerificationRequest) {
  return VerificationRequestModel.findOneAndUpdate({ uuid: model.uuid }, model)
}

export async function loadVerificationRequestDB(
  uuid: string
): Promise<VerificationRequest | null> {
  return VerificationRequestModel.findOne({ uuid })
}

export async function loadVerificationRequestWithState(
  uuid: string,
  state: string
): Promise<VerificationRequest> {
  let verificationRequest
  try {
    verificationRequest = await loadVerificationRequestDB(uuid)
  } catch {
    throw 'Failed to query database for VerificationRequest'
  }

  if (!verificationRequest) {
    throw 'Invalid VerificationRequest'
  }

  if (verificationRequest.state !== state) {
    throw 'Verification request has wrong state'
  }

  try {
    const verifiedToken = await loadVerifiedTokenDB(
      verificationRequest.tokenAddress,
      verificationRequest.chain
    )

    if (verifiedToken) {
      throw 'The owner of this token has already been verified.'
    }
  } catch {
    throw 'Database query failed'
  }

  return verificationRequest
}
