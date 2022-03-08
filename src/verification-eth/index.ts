/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-await-in-loop */
/* eslint-disable unicorn/consistent-destructuring */

/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable require-unicode-regexp */
import BN from 'bn.js'
import Web3 from 'web3'

import { getRPC, getPrivateKey, getContractAddress } from '../../config/default'
import type { QueueWork } from '../queue'
import { Queue } from '../queue'
import {
  insertVerifiedTokenDB,
  loadVerifiedTokenDB,
} from '../services/verification.service'
import type { VerificationRequest } from '../types/verification-request'
import type { VerifiedToken } from '../types/verified-token'
import ABI from './verification-abi.json'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const CHAIN = {
  AVM: 'avm',
  MAINNET: 'mainnet',
  RINKEBY: 'rinkeby',
  TEST: 'test',
  TEST_AVM_L2: 'test-avm-l2',
}

const weiFastestGasPrice = new BN(2_000_000_000)

function getWeb3(chain: string): Web3 {
  return new Web3(getRPC(chain))
}

export function getContract(chain: string): any {
  const web3 = getWeb3(chain)
  const account = web3.eth.accounts.privateKeyToAccount(getPrivateKey(chain))
  web3.eth.accounts.wallet.add(account)
  return new web3.eth.Contract(ABI as any, getContractAddress(chain), {
    from: account.address,
  })
}

const workQueue = new Queue(async (q: QueueWork[]) => {
  while (q.length > 0) {
    const w = q[0]
    q.shift()

    const { resolve, reject } = w
    const req: VerificationRequest = w.work

    try {
      const verified = await loadVerifiedTokenDB(req.tokenAddress, req.chain)

      if (verified) {
        reject('The owner of this token has already been verified.')
        continue
      }
    } catch (error) {
      console.log(error)
      reject('Database communication failed.')
      continue
    }

    const contract = getContract(req.chain)

    try {
      contract.methods
        .setTokenOwner(req.tokenAddress, req.ownerAddress)
        .send({
          gasLimit: '5000000', // This is ArbGas, not normal gas
          gasPrice: weiFastestGasPrice,
        })
        .on('transactionHash', async (tx: string) => {
          const verified: VerifiedToken = {
            exists: true,
            tokenAddress: req.tokenAddress,
            ownerAddress: req.ownerAddress,
            chain: req.chain,
            tx,
          }

          try {
            await insertVerifiedTokenDB(verified)
          } catch (error) {
            console.log(error)
          }

          resolve(tx)
        })
        .on('error', (err: string) => {
          console.log(err)
        })
    } catch {
      reject('Failed to submit tx to chain.')
    }
  }
})

async function updateGasPrice() {
  // Hardcode to 2 gwei for now since getGasPrice() is not working on Arbitrum
  /*
  const old = weiFastestGasPrice
  const web3 = getWeb3(CHAIN.AVM)
  try {
    weiFastestGasPrice = Math.floor(parseInt(await web3.eth.getGasPrice()) * 1.5)
  } catch (ex) {
    log(LOG_LEVEL.ERROR, `eth: getNodeGasPrice: ${ex}`)
    weiFastestGasPrice = 150000000000
  } finally {
    log(
      LOG_LEVEL.INFO,
      `eth: updated gas price from ${old} to ${weiFastestGasPrice}`
    )
    setTimeout(updateGasPrice, 30000)
  }*/
}

export async function initETH() {
  await updateGasPrice()
}

export function getAddress(chain: string): string {
  const web3 = getWeb3(chain)
  const account = web3.eth.accounts.privateKeyToAccount(getPrivateKey(chain))
  return account.address
}

export async function calculateTxWeiCost(gas: number): Promise<string> {
  const gasPriceBN = new BN(weiFastestGasPrice.toString())
  const gasBN = new BN(gas.toString())

  return gasPriceBN.mul(gasBN).toString()
}

export function isTxHash(hash: string): boolean {
  return /^0x([\dA-Fa-f]{64})$/.test(hash)
}

export async function checkFeeTx(
  chain: string,
  tx: string,
  to: string,
  wei: string,
  sha: string
) {
  const web3 = getWeb3(chain)
  const result = await web3.eth.getTransaction(tx)
  if (!result) {
    throw 'Tx not found'
  }

  if (!result.blockNumber) {
    throw 'Tx not confirmed'
  }

  if (!result.to) {
    throw 'Tx has no "to" field'
  }

  if (result.to.toLowerCase() !== to.toLowerCase()) {
    throw 'Tx sent to wrong address'
  }

  if (!result.value) {
    throw 'Tx has no "value" field'
  }

  const value = new BN(result.value)
  if (value.lt(new BN(wei))) {
    throw 'Tx has not enough value'
  }

  if (result.input.slice(2) !== sha) {
    throw 'Tx has invalid input'
  }
}

export function toChecksumedAddress(addr: string): string {
  const web3 = new Web3()
  return web3.utils.toChecksumAddress(addr)
}

export function isAddress(addr: string): boolean {
  try {
    toChecksumedAddress(addr)
    return true
  } catch {
    return false
  }
}

export async function verify(req: VerificationRequest): Promise<string> {
  return workQueue.pushWork(req)
}

export function stringToChain(str: string): string {
  const lower = str.toLowerCase()

  switch (lower) {
    case CHAIN.MAINNET: {
      return CHAIN.MAINNET
    }
    case CHAIN.AVM: {
      return CHAIN.AVM
    }
    case CHAIN.RINKEBY: {
      return CHAIN.RINKEBY
    }
    case CHAIN.TEST: {
      return CHAIN.TEST
    }
    case CHAIN.TEST_AVM_L2: {
      return CHAIN.TEST_AVM_L2
    }
    // No default
  }

  throw 'invalid chain'
}
