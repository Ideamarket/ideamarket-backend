import config from 'config'
import Web3 from 'web3'

import { getL1Network } from '../util/web3Util'
import { getDeployedABIs } from './abis'
import { getDeployedAddresses } from './deployedAddresses'

const NETWORK = config.get<string>('web3.network')
const L1_NETWORK = getL1Network(NETWORK)
const RPC_URL = config.get<string>(`web3.rpcUrls.${NETWORK}`)
const PRIVATE_KEY = config.get<string>(`web3.privateKeys.${NETWORK}`)

const web3 = new Web3(RPC_URL)

/**
 * Returns idea token valut contract for L1 layer
 */
export function getIdeaTokenVaultContractForL1() {
  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  web3.eth.accounts.wallet.add(account)
  return new web3.eth.Contract(
    getDeployedABIs(L1_NETWORK).ideaTokenVault as any,
    getDeployedAddresses(L1_NETWORK)?.ideaTokenVault ?? undefined,
    { from: web3.eth.defaultAccount ?? undefined }
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
