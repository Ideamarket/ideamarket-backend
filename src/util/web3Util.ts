/* eslint-disable sonarjs/no-duplicate-string */
import BN from 'bn.js'
import config from 'config'
import Web3 from 'web3'

import ABI from './abi.json'

import { bigNumberTenPow18, web3BNToFloatString } from '.'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const COMPOUND_SUPPLY_RATE = 0.06
const weiFastestGasPrice = new BN(2_000_000_000)

export const NETWORK = config.get<string>('web3.network')
const RPC_URL = config.get<string>(`web3.rpcUrls.${NETWORK}`)
export const SUBGRAPH_URL = config.get<string>(`web3.subgraphUrls.${NETWORK}`)
const PRIVATE_KEY = config.get<string>(`web3.privateKeys.${NETWORK}`)
const CONTRACT_ADDRESS = config.get<string>(`web3.contractAddresses.${NETWORK}`)

export const V2_NETWORK = config.get<string>('web3.v2Network')
export const SUBGRAPH_URL_V2 = config.get<string>(
  `web3.subgraphUrlsV2.${V2_NETWORK}`
)

const web3 = new Web3(RPC_URL)

export function getL1Network(network: string) {
  switch (network) {
    case 'avm':
      return 'mainnet'
    case 'mainnet':
      return 'mainnet'
    case 'rinkeby':
      return 'rinkeby'
    case 'test-avm-l1':
      return 'test-avm-l1'
    case 'test-avm-l2':
      return 'test-avm-l1'
    case 'test':
      return 'test'
    default:
      return 'test'
  }
}

/**
 * This functions generates the contract
 */
export function getContract() {
  const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY)
  web3.eth.accounts.wallet.add(account)
  return new web3.eth.Contract(ABI as any, CONTRACT_ADDRESS, {
    from: account.address,
  })
}

/**
 * This function sets the tokenOwner in the blockchain
 */
export async function setTokenOwner({
  tokenAddress,
  ownerAddress,
}: {
  tokenAddress: string
  ownerAddress: string
}) {
  const contract = getContract()
  try {
    const res = await contract.methods
      .setTokenOwner(tokenAddress, ownerAddress)
      .send({
        gasLimit: '5000000', // This is ArbGas, not normal gas
        gasPrice: weiFastestGasPrice,
      })
    console.info(
      `TransactionHash=${
        res.transactionHash as string
      } :: Updated owner=${ownerAddress} for token=${tokenAddress}`
    )
    return true
  } catch (error) {
    console.error('Error occurred while setting token owner', error)
  }
  return false
}

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
