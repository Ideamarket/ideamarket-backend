import config from 'config'
import Web3 from 'web3'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NETWORK: string = config.get('web3.network')
const RPC_URL: string = config.get(`web3.rpcUrls.${NETWORK}`)
export const SUBGRAPH_URL: string = config.get(`web3.subgraphUrls.${NETWORK}`)

const web3 = new Web3(RPC_URL)

/**
 * Returns whether the eth address is valid or not
 */
export function isValidEthAddress(ethAddress: string) {
  return web3.utils.isAddress(ethAddress)
}

/**
 * Recovers the address from signature
 */
export function recoverEthAddresses(signedWalletAddress: SignedWalletAddress) {
  return web3.eth.accounts.recover(
    signedWalletAddress.message,
    signedWalletAddress.signature
  )
}

export type SignedWalletAddress = {
  message: string
  signature: string
}
