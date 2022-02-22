 
/* eslint-disable no-await-in-loop */
/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import {
  calculateTxWeiCost,
  checkFeeTx,
  getAddress,
  isAddress,
  isTxHash,
  stringToChain,
  verify,
  ZERO_ADDRESS,
} from 'eth'
import type { Request, Response } from 'express'
import { v4 as uuidv4, validate } from 'uuid'
import { checkVerification } from 'verifiers'

import { getMarketConfig } from '../../config/default'
import { handleSuccess, handleError, handleFailed } from '../lib/base'
import { executeSubgraphTokenInfoQuery } from '../services/subgraph.service'
import {
  insertVerificationRequestDB,
  loadVerificationRequestWithState,
  loadVerifiedTokenDB,
  updateVerificationRequestDB,
} from '../services/verification.service'
import type { SubgraphTokenInfoQueryResult } from '../types/subgraph.types'
import type { VerificationRequest } from '../types/verification-request'
import { VERIFICATION_STATE } from '../types/verification-request'
import { log, LOG_LEVEL, sleep, uuidToSHA3 } from '../util'

export async function request(req: Request, res: Response) {
  const {
    tokenAddress: tokenAddressRaw,
    ownerAddress: ownerAddressRaw,
    chain: chainRaw,
  }: {
    tokenAddress: string
    ownerAddress: string
    chain: string
  } = req.body

  const tokenAddress = tokenAddressRaw.toLowerCase()
  if (!isAddress(tokenAddress)) {
    return handleFailed(res, 'Token address is not a valid address.')
  }

  const ownerAddress = ownerAddressRaw.toLowerCase()
  if (!isAddress(ownerAddress)) {
    return handleFailed(res, 'Owner address is not a valid address.')
  }

  let chain
  try {
    chain = stringToChain(chainRaw)
  } catch {
    return handleFailed(res, 'Unable to convert chain to string')
  }

  try {
    const verifiedToken = await loadVerifiedTokenDB(tokenAddress, chain)

    if (verifiedToken) {
      return handleFailed(
        res,
        'The owner of this token has already been verified.'
      )
    }

    let tokenInfo: SubgraphTokenInfoQueryResult
    try {
      tokenInfo = await executeSubgraphTokenInfoQuery(tokenAddress, chain)
    } catch {
      return handleFailed(res, 'Failed to query subgraph')
    }

    if (tokenInfo.tokenOwner !== ZERO_ADDRESS) {
      return handleFailed(
        res,
        'The owner of this token has already been verified.'
      )
    }

    // Generate UUID
    const uuid = uuidv4()

    const verificationRequest: VerificationRequest = {
      state: VERIFICATION_STATE.AWAITING_VERIFICATION,
      tokenAddress,
      ownerAddress,
      chain,
      uuid,
      weiFee: '0',
      feeTx: '',
      createdAt: Date.now(),
    }

    try {
      await insertVerificationRequestDB(verificationRequest)
    } catch {
      return handleFailed(res, 'Database communication failed.')
    }

    return handleSuccess(res, { data: { uuid } })
  } catch (error) {
    return handleError(res, error, 'Unable to handle fetching comments')
  }
}

export async function submitted(req: Request, res: Response) {
  const ip = req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
  console.log(`[${ip}] Received VerificationSubmitted request`)

  const {
    uuid: uuidRaw,
  }: {
    uuid: string
  } = req.body

  const uuid = uuidRaw.toLowerCase()
  if (!validate(uuid)) {
    return handleFailed(res, 'Failed to verify UUID.')
  }

  let verificationRequest
  try {
    verificationRequest = await loadVerificationRequestWithState(
      uuid,
      VERIFICATION_STATE.AWAITING_VERIFICATION
    )
  } catch (error) {
    return handleFailed(res, error as any)
  }

  // Get token info from subgraph
  let tokenInfo
  try {
    tokenInfo = await executeSubgraphTokenInfoQuery(
      verificationRequest.tokenAddress,
      verificationRequest.chain
    )
  } catch (error) {
    return handleFailed(res, error as any)
  }

  // Check if token is already listed as verified in contract
  if (tokenInfo.tokenOwner !== ZERO_ADDRESS) {
    return handleFailed(
      res,
      'The owner of this token has already been verified.'
    )
  }

  // Get the market config
  let marketConfig
  try {
    marketConfig = getMarketConfig(
      tokenInfo.marketName,
      verificationRequest.chain
    )
  } catch (error) {
    return handleFailed(res, error as any)
  }

  if (!marketConfig.skipVerification) {
    // Check for verification
    try {
      const isVerified = await checkVerification(
        tokenInfo.tokenName,
        tokenInfo.marketName,
        uuidToSHA3(uuid)
      )
      if (!isVerified) {
        return handleFailed(res, 'Verification failed.')
      }
    } catch (error) {
      console.log(error)
      return handleFailed(res, 'Verification failed with an exception..')
    }
  }

  // Check if this market takes a verification fee
  if (marketConfig.feeEnabled) {
    // We want a fee, get the cost for the tx
    const estimatedGas = 60_000 // 60k gas
    const weiFee = await calculateTxWeiCost(estimatedGas)

    verificationRequest.state = VERIFICATION_STATE.AWAITING_FEE_TX_CONFIRMATION
    verificationRequest.weiFee = weiFee

    try {
      await updateVerificationRequestDB(verificationRequest)
    } catch (error) {
      console.log(error)
      return handleFailed(res, 'Failed to store updated state in DB')
    }

    return handleSuccess(res, {
      wantFee: true,
      wei: weiFee,
      to: getAddress(verificationRequest.chain),
    })
  }
  // We do not want a fee and can submit the tx directly
  // verify() will handle updating the db
  let tx
  try {
    tx = await verify(verificationRequest)
  } catch (error) {
    return handleFailed(res, error as any)
  }

  return handleSuccess(res, { wantFee: false, tx })
}

export async function feeTxConfirmed(req: Request, res: Response) {
  const ip = req.headers['x-forwarded-for'] ?? req.connection.remoteAddress
  log(LOG_LEVEL.INFO, `[${ip}] Received FeeTxConfirmed request`)

  const {
    uuid: uuidRaw,
    tx: txRaw,
  }: {
    uuid: string
    tx: string
  } = req.body

  const uuid = uuidRaw.toLowerCase()

  if (!validate(uuid)) {
    return handleFailed(res, 'Failed to verify UUID.')
  }

  if (typeof txRaw !== 'string' || !isTxHash(txRaw)) {
    return handleFailed(res, 'Invalid tx value')
  }

  const tx = txRaw

  let verificationRequest
  try {
    verificationRequest = await loadVerificationRequestWithState(
      uuid,
      VERIFICATION_STATE.AWAITING_FEE_TX_CONFIRMATION
    )
  } catch (error) {
    return handleFailed(res, error as any)
  }

  // Get token info from subgraph
  let tokenInfo
  try {
    tokenInfo = await executeSubgraphTokenInfoQuery(
      verificationRequest.tokenAddress,
      verificationRequest.chain
    )
  } catch (error) {
    return handleFailed(res, error as any)
  }

  // Check if token is already listed as verified in contract
  if (tokenInfo.tokenOwner !== ZERO_ADDRESS) {
    return handleFailed(
      res,
      'The owner of this token has already been verified.'
    )
  }

  // Check that the tx is confirmed and valid
  // It can be possible that our node has not picked up the tx
  // when this request arrives.
  // We retry three times with 1 sec sleep between each retry
  let txIsValid = false
  let lastEx = ''
  for (let i = 0; i < 3; i++) {
    if (i > 0) {
      await sleep(1000)
    }

    try {
      await checkFeeTx(
        verificationRequest.chain,
        tx,
        getAddress(verificationRequest.chain),
        verificationRequest.weiFee,
        uuidToSHA3(verificationRequest.uuid)
      )
      txIsValid = true
      break
    } catch (error) {
      lastEx = error as any
      log(LOG_LEVEL.ERROR, error as any)
    }
  }

  if (!txIsValid) {
    return handleFailed(res, lastEx)
  }

  // The fee tx is confirmed, we can submit our tx
  // verify() will handle updating the db
  verificationRequest.feeTx = tx
  let verificationTx
  try {
    verificationTx = await verify(verificationRequest)
  } catch (error) {
    return handleFailed(res, error as any)
  }

  return handleSuccess(res, { tx: verificationTx })
}
