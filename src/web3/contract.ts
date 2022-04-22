import config from 'config'
import Web3 from 'web3'

import { getL1Network } from '../util/web3Util'
import { getDeployedABIs } from './abis'
import { getDeployedAddresses } from './deployedAddresses'

const NETWORK = config.get<string>('web3.network')
const L1_NETWORK = getL1Network(NETWORK)

const RPC_URL = config.get<string>(`web3.rpcUrls.${NETWORK}`)
const L1_RPC_URL = config.get<string>(`web3.rpcUrls.${L1_NETWORK}`)

const PRIVATE_KEY = config.get<string>(`web3.privateKeys.${NETWORK}`)
const L1_PRIVATE_KEY = config.get<string>(`web3.privateKeys.${L1_NETWORK}`)

const web3 = new Web3(RPC_URL)
const web3L1 = new Web3(L1_RPC_URL)

/**
 * Returns idea token valut contract for L1 layer
 */
export function getIdeaTokenVaultContractForL1() {
  const account = web3L1.eth.accounts.privateKeyToAccount(L1_PRIVATE_KEY)
  web3L1.eth.accounts.wallet.add(account)
  return new web3L1.eth.Contract(
    getDeployedABIs(L1_NETWORK).ideaTokenVault as any,
    getDeployedAddresses(L1_NETWORK)?.ideaTokenVault ?? undefined,
    { from: web3L1.eth.defaultAccount ?? undefined }
  )
}

/**
 * Returns idea token valut contract
 */
export function getIdeaTokenVaultContract() {
  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  web3.eth.accounts.wallet.add(account)
  return new web3.eth.Contract(
    getDeployedABIs(NETWORK).ideaTokenVault as any,
    getDeployedAddresses(NETWORK)?.ideaTokenVault ?? undefined,
    { from: web3.eth.defaultAccount ?? undefined }
  )
}
