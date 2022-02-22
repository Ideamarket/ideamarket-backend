import BN from 'bn.js'
import config from 'config'
import Web3 from 'web3'

import { bigNumberTenPow18, web3BNToFloatString } from '.'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const COMPOUND_SUPPLY_RATE = 0.06

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

export function calculatePrice(rawPrice: string) {
  return Number.parseFloat(Number.parseFloat(rawPrice).toFixed(2))
}

export function calculateDayChange(rawDayChange: string) {
  return Number.parseFloat((Number.parseFloat(rawDayChange) * 100).toFixed(2))
}

export function calculateMarketCap(rawMarketCap: string) {
  return Number.parseFloat(
    web3BNToFloatString(new BN(rawMarketCap), bigNumberTenPow18, 2)
  )
}

export function calculateYearIncome(rawMarketCap: string) {
  return Number.parseFloat(
    (calculateMarketCap(rawMarketCap) * getCompoundSupplyRate()).toFixed(2)
  )
}

// TODO : This calculation will get changed when we include interest in L2
function getCompoundSupplyRate() {
  return COMPOUND_SUPPLY_RATE
}

// TODO : This calculation will get changed when we include interest in L2
export function calculateClaimableIncome() {
  return 0
}

export function isListingVerified(tokenOwner: string) {
  return tokenOwner !== ZERO_ADDRESS
}
