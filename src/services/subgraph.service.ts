/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable no-constant-condition */
/* eslint-disable unicorn/no-keyword-prefix */
/* eslint-disable no-await-in-loop */
import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import config from 'config'
import { gql, request } from 'graphql-request'

import type { OnchainTokens, Web3TokenData } from '../types/listing.types'
import type {
  IdeaToken,
  IdeaTokenMarketPair,
  IdeaTokens,
  IdeaTokenTrade,
  LockedIdeaTokenMarketPair,
  WalletHolding,
} from '../types/subgraph.types'
import {
  bigNumberTenPow18,
  calculateIdeaTokenDaiValue,
  floatToWeb3BN,
  web3BNToFloatString,
} from '../util'
import {
  getLockedTokensQuery,
  getMyTradesQuery,
  getOwnedTokensMaybeMarketQuery,
  getTokensByMarketIdAndIdQuery,
} from '../util/queries'
import { getAllTokensQuery } from '../util/queries/getAllTokensQuery'
import {
  apiResponseToIdeaMarket,
  apiResponseToIdeaToken,
  sortTrades,
  sortWalletHoldings,
} from '../util/subgraphUtil'
import {
  getIdeaTokenVaultContract,
  getIdeaTokenVaultContractForL1,
} from '../web3/contract'
import { EntityNotFoundError, InternalServerError } from './errors'
import { fetchListingId, updateOnchainListing } from './listing.service'

const NETWORK = config.get<string>('web3.network')
const SUBGRAPH_URL_L1 = config.get<string>(`web3.subgraphUrlsL1.${NETWORK}`)
const SUBGRAPH_URL = config.get<string>(`web3.subgraphUrls.${NETWORK}`)

type WalletHoldingsQueryOptions = {
  marketIds: number[]
  skip: number
  limit: number
  orderBy: string
  orderDirection: string
  filterTokens: string[]
  search: string | null
  locked: boolean | null
}

type TradesQueryOptions = {
  marketIds: number[]
  skip: number
  limit: number
  orderBy: string
  orderDirection: string
  filterTokens: string[]
  search: string | null
}

export async function executeSubgraphQuery(
  query: string
): Promise<OnchainTokens> {
  return request(
    SUBGRAPH_URL,
    gql`
      ${query}
    `
  )
}

export async function fetchAllOnchainTokensFromWeb3() {
  try {
    const allOnchainTokens: IdeaToken[] = []

    let index = 0
    let fetchedAll = false
    while (!fetchedAll) {
      const onchainListings: IdeaTokens = await request(
        SUBGRAPH_URL,
        getAllTokensQuery({ skip: index * 100, limit: 100 })
      )
      allOnchainTokens.push(...onchainListings.ideaTokens)
      if (onchainListings.ideaTokens.length === 0) {
        fetchedAll = true
      }
      index += 1
    }

    console.log(`Total Onchain tokens found = ${allOnchainTokens.length}`)
    return allOnchainTokens
  } catch (error) {
    console.error(
      'Error occurred while fetching onchain tokens from subgraph',
      error
    )
    throw new InternalServerError(
      'Failed to fetch onchain tokens from subgraph'
    )
  }
}

export async function copyNewOnchainTokensToWeb2() {
  const allOnchainIdeaTokens: IdeaToken[] =
    await fetchAllOnchainTokensFromWeb3()

  let newOnchainListings = 0
  const totalOnchainListings = allOnchainIdeaTokens.length
  if (totalOnchainListings === 0) {
    throw new EntityNotFoundError(null, 'Got 0 onchain listings from subgraph')
  }

  try {
    for (const ideaToken of allOnchainIdeaTokens) {
      const onchainListing = await updateOnchainListing({
        ideaToken,
        updateIfExists: false,
      })

      if (onchainListing) {
        newOnchainListings += 1
      }
    }

    return { totalOnchainListings, newOnchainListings }
  } catch (error) {
    console.error(
      'Error occurred while adding cloned onchain listings to web2',
      error
    )
    throw new InternalServerError(
      'Failed to add cloned onchain listings to web2'
    )
  }
}

export async function fetchSubgraphData({
  marketId,
  id,
}: {
  marketId: number
  id: string
}) {
  const onchainTokens = await request(
    SUBGRAPH_URL,
    getTokensByMarketIdAndIdQuery({ marketId, id })
  )
  return onchainTokens.ideaMarkets[0].tokens[0] as Partial<Web3TokenData>
}

export async function fetchWalletHoldingsFromSubgraph({
  owner,
  options,
}: {
  owner: string
  options: WalletHoldingsQueryOptions
}) {
  const {
    marketIds,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    search,
    locked,
  } = options
  const ownedTokens = await fetchOwnedTokensFromSubgraph(owner)
  const lockedTokens = await fetchLockedTokensFromSubgraph(owner)

  // Calculate the total value of non-locked tokens
  let ownedTotal = new BN('0')
  for (const ownedToken of ownedTokens ?? []) {
    ownedTotal = ownedTotal.add(
      calculateIdeaTokenDaiValue(
        ownedToken.token?.rawSupply ?? new BN(0),
        ownedToken.market,
        ownedToken.rawBalance ?? new BN(0)
      )
    )
  }
  const totalOwnedTokensValue =
    ownedTokens.length > 0
      ? web3BNToFloatString(ownedTotal, bigNumberTenPow18, 18)
      : '0.00'

  // Calculate the total value of locked tokens
  let lockedTotal = new BN('0')
  for (const lockedToken of lockedTokens ?? []) {
    lockedTotal = lockedTotal.add(
      calculateIdeaTokenDaiValue(
        lockedToken.token?.rawSupply ?? new BN(0),
        lockedToken.market,
        lockedToken.rawBalance ?? new BN(0)
      )
    )
  }
  const totalLockedTokensValue =
    lockedTokens.length > 0
      ? web3BNToFloatString(lockedTotal, bigNumberTenPow18, 18)
      : '0.00'

  const holdings = combineOwnedAndLockedTokens({
    ownedTokens,
    lockedTokens,
  })

  // Filtering wallet holdings
  const filteredHoldings = holdings
    .filter((holding) => marketIds.includes(holding.market.marketID ?? 1))
    .filter((holding) => (locked ? !!holding.lockedAmount : true))
    .filter((holding) =>
      filterTokens.length > 0 ? filterTokens.includes(holding.listingId) : true
    )
    .filter((holding) =>
      search
        ? (holding.token.name as string)
            .toLowerCase()
            .includes(search.toLowerCase())
        : true
    )

  // Sorting wallet holdings
  sortWalletHoldings({ holdings: filteredHoldings, orderBy, orderDirection })

  return {
    totalOwnedTokensValue,
    totalLockedTokensValue,
    holdings: filteredHoldings.slice(skip, skip + limit),
  }
}

export async function fetchOwnedTokensFromSubgraph(
  owner: string
): Promise<IdeaTokenMarketPair[]> {
  const l1Result = []
  let page = 0
  while (true) {
    let result = null
    try {
      result = await request(
        SUBGRAPH_URL_L1,
        getOwnedTokensMaybeMarketQuery({
          owner,
          limit: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getOwnedTokensMaybeMarketQuery failed for L1', error)
    }
    const tokensInThisPage = result?.ideaTokenBalances ?? []
    l1Result.push(...tokensInThisPage)

    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const l2Result = []
  page = 0
  while (true) {
    let result = null
    try {
      result = await request(
        SUBGRAPH_URL,
        getOwnedTokensMaybeMarketQuery({
          owner,
          limit: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getOwnedTokensMaybeMarketQuery failed for L2', error)
    }
    const tokensInThisPage = result?.ideaTokenBalances ?? []
    l2Result.push(...tokensInThisPage)

    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const l1OwnedTokens = await Promise.all(
    l1Result.map(async (ownedToken: any) =>
      mapOwnedToken({ ownedToken, owner, isL1: true })
    )
  )
  const l2OwnedTokens = await Promise.all(
    l2Result.map(async (ownedToken: any) =>
      mapOwnedToken({ ownedToken, owner, isL1: false })
    )
  )

  return [...l1OwnedTokens, ...l2OwnedTokens]
}

async function mapOwnedToken({
  ownedToken,
  owner,
  isL1,
}: {
  ownedToken: any
  owner: string
  isL1: boolean
}): Promise<IdeaTokenMarketPair> {
  return {
    listingId: await fetchListingId({
      marketId: ownedToken.market.marketID,
      onchainValue: ownedToken.token.name,
    }),
    token: apiResponseToIdeaToken(
      ownedToken.token,
      ownedToken.market,
      owner,
      isL1
    ),
    market: apiResponseToIdeaMarket(ownedToken.market),
    rawBalance: ownedToken.amount ? new BN(ownedToken.amount) : undefined,
    balance: ownedToken.amount
      ? web3BNToFloatString(new BN(ownedToken.amount), bigNumberTenPow18, 2)
      : undefined,
  }
}

export async function fetchLockedTokensFromSubgraph(
  owner: string
): Promise<LockedIdeaTokenMarketPair[]> {
  const l1Result = []
  let page = 0
  while (true) {
    let result = null
    try {
      result = await request(
        SUBGRAPH_URL_L1,
        getLockedTokensQuery({
          ownerAddress: owner,
          limit: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getLockedTokensQuery failed for L1', error)
    }
    const tokensInThisPage = result?.lockedIdeaTokenAmounts ?? []
    l1Result.push(...tokensInThisPage)

    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const l2Result = []
  page = 0
  while (true) {
    let result = null
    try {
      result = await request(
        SUBGRAPH_URL,
        getLockedTokensQuery({
          ownerAddress: owner,
          limit: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getLockedTokensQuery failed for L2', error)
    }
    const tokensInThisPage = result?.lockedIdeaTokenAmounts ?? []
    l2Result.push(...tokensInThisPage)

    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const l1LockedTokens = await Promise.all(
    l1Result.map(async (lockedToken: any) =>
      mapLockedToken({ lockedToken, owner, isL1: true })
    )
  )
  const l2LockedTokens = await Promise.all(
    l2Result.map(async (lockedToken: any) =>
      mapLockedToken({ lockedToken, owner, isL1: false })
    )
  )

  const lockedTokens = [...l1LockedTokens, ...l2LockedTokens]
  return sanitizeLockedTokens({
    ownerAddress: owner,
    lockedTokens,
  })
}

async function sanitizeLockedTokens({
  ownerAddress,
  lockedTokens,
}: {
  ownerAddress: string
  lockedTokens: LockedIdeaTokenMarketPair[]
}) {
  const tokenAddressesCovered = new Set()
  const actualLockedTokensFromWeb3: {
    tokenAddress: string
    isL1: boolean
    lockedUntil: number
    lockedAmount: number
  }[] = []

  for (const lockedToken of lockedTokens) {
    const tokenAddress = lockedToken.token.address ?? ''
    const isL1 = !!lockedToken.token.isL1
    const searchToken = `${tokenAddress}_${isL1}`
    if (tokenAddressesCovered.has(searchToken)) {
      continue
    }

    const web3LockedEntries = await getLockedEntriesFromWeb3({
      tokenAddress,
      ownerAddress,
      isL1,
    })
    actualLockedTokensFromWeb3.push(
      ...web3LockedEntries.map((entry: any) => ({
        tokenAddress,
        isL1,
        lockedUntil: entry.lockedUntil,
        lockedAmount: entry.lockedAmount,
      }))
    )
    tokenAddressesCovered.add(searchToken)
  }

  return lockedTokens.filter((lockedToken) => {
    const actualLockedTokens = actualLockedTokensFromWeb3.filter(
      (actualLockedToken) =>
        actualLockedToken.tokenAddress === lockedToken.token.address &&
        actualLockedToken.isL1 === !!lockedToken.token.isL1 &&
        actualLockedToken.lockedUntil === lockedToken.lockedUntil
    )
    return actualLockedTokens.length > 0
  })
}

async function mapLockedToken({
  lockedToken,
  owner,
  isL1,
}: {
  lockedToken: any
  owner: string
  isL1: boolean
}): Promise<LockedIdeaTokenMarketPair> {
  return {
    listingId: await fetchListingId({
      marketId: lockedToken.token.market.marketID,
      onchainValue: lockedToken.token.name,
    }),
    token: apiResponseToIdeaToken(
      lockedToken.token,
      lockedToken.token.market,
      owner,
      isL1
    ),
    market: apiResponseToIdeaMarket(lockedToken.token.market),
    rawBalance: lockedToken.amount ? new BN(lockedToken.amount) : undefined,
    balance: lockedToken.amount
      ? web3BNToFloatString(new BN(lockedToken.amount), bigNumberTenPow18, 2)
      : undefined,
    lockedUntil: lockedToken.lockedUntil,
  }
}

function combineOwnedAndLockedTokens({
  ownedTokens,
  lockedTokens,
}: {
  ownedTokens: IdeaTokenMarketPair[]
  lockedTokens: LockedIdeaTokenMarketPair[]
}): WalletHolding[] {
  const walletHoldings = []
  const walletHoldingsSet = new Set()

  for (const ownedToken of ownedTokens) {
    const tokenAddress = ownedToken.token.address ?? ''
    const isL1 = !!ownedToken.token.isL1
    const searchToken = `${tokenAddress}_${isL1}`

    const similarLockedTokens = lockedTokens.filter(
      (lockedToken) =>
        lockedToken.token.address === tokenAddress &&
        lockedToken.token.isL1 === isL1
    )

    walletHoldingsSet.add(searchToken)
    if (similarLockedTokens.length === 0) {
      walletHoldings.push(ownedToken)
      continue
    }

    const lockedTokensBalance = similarLockedTokens
      .map((lockedToken) => lockedToken.balance)
      .reduce((a, b) => a + Number.parseFloat(b ?? '0'), 0)

    const newBalance = (
      Number.parseFloat(ownedToken.balance ?? '0') + lockedTokensBalance
    ).toString()

    walletHoldings.push({
      ...ownedToken,
      balance: newBalance,
      rawBalance: floatToWeb3BN(newBalance, 18, BigNumber.ROUND_DOWN),
      lockedAmount: lockedTokensBalance,
    })
  }

  const missedLockedTokens = lockedTokens.filter(
    (lockedToken) =>
      !walletHoldingsSet.has(
        `${lockedToken.token.address ?? ''}_${!!lockedToken.token.isL1}`
      )
  )
  const lockedTokensSet = new Set()

  for (const lockedToken of missedLockedTokens) {
    const tokenAddress = lockedToken.token.address ?? ''
    const isL1 = !!lockedToken.token.isL1
    const searchToken = `${tokenAddress}_${isL1}`

    if (lockedTokensSet.has(searchToken)) {
      continue
    }

    const similarLockedTokens = missedLockedTokens.filter(
      (missedLockedToken) =>
        tokenAddress === missedLockedToken.token.address &&
        isL1 === !!missedLockedToken.token.isL1
    )
    lockedTokensSet.add(searchToken)

    const lockedTokensBalance = similarLockedTokens
      .map((lockedToken) => lockedToken.balance)
      .reduce((a, b) => a + Number.parseFloat(b ?? '0'), 0)
    const newBalance = lockedTokensBalance.toString()

    walletHoldings.push({
      ...lockedToken,
      balance: newBalance,
      rawBalance: floatToWeb3BN(newBalance, 18, BigNumber.ROUND_DOWN),
      lockedAmount: lockedTokensBalance,
    })
  }

  return walletHoldings
}

export async function fetchTradesFromSubgraph({
  owner,
  options,
}: {
  owner: string
  options: TradesQueryOptions
}) {
  const {
    marketIds,
    skip,
    limit,
    orderBy,
    orderDirection,
    filterTokens,
    search,
  } = options

  const l2Result = []
  let page = 0
  while (true) {
    let result = null
    try {
      result = await request(
        SUBGRAPH_URL,
        getMyTradesQuery({
          ownerAddress: owner,
          first: 100,
          skip: page * 100,
        })
      )
    } catch (error) {
      console.error('getMyTradesQuery failed', error)
    }
    const tokensInThisPage = result?.ideaTokenTrades ?? []
    l2Result.push(...tokensInThisPage)
    if (tokensInThisPage.length < 100) {
      break
    }
    page += 1
  }

  const allTrades = await Promise.all(
    l2Result.map(async (ideaTokenTrade: any) =>
      mapTrade({ trade: ideaTokenTrade, owner })
    )
  )

  // Calculate the total purchase value
  let purchaseTotal = new BN('0')
  for (const trade of allTrades ?? []) {
    if (trade.isBuy) {
      purchaseTotal = purchaseTotal.add(trade.rawDaiAmount)
    }
  }
  const totalTradesValue =
    allTrades.length > 0
      ? web3BNToFloatString(purchaseTotal, bigNumberTenPow18, 18)
      : '0.00'

  // Filtering trades
  const filteredTrades = allTrades
    .filter((trade) => marketIds.includes(trade.market.marketID))
    .filter((trade) =>
      filterTokens.length > 0 ? filterTokens.includes(trade.listingId) : true
    )
    .filter((trade) =>
      search
        ? trade.token.name.toLowerCase().includes(search.toLowerCase())
        : true
    )

  // Sorting trades
  sortTrades({ trades: filteredTrades, orderBy, orderDirection })

  return {
    totalTradesValue,
    trades: filteredTrades.slice(skip, skip + limit),
  }
}

async function mapTrade({
  trade,
  owner,
}: {
  trade: any
  owner: string
}): Promise<IdeaTokenTrade> {
  return {
    listingId: await fetchListingId({
      marketId: trade.token.market.marketID,
      onchainValue: trade.token.name,
    }),
    isBuy: trade.isBuy,
    timestamp: Number(trade.timestamp),
    rawIdeaTokenAmount: new BN(trade.ideaTokenAmount),
    ideaTokenAmount: Number(
      web3BNToFloatString(new BN(trade.ideaTokenAmount), bigNumberTenPow18, 2)
    ),
    rawDaiAmount: new BN(trade.daiAmount),
    daiAmount: Number(
      web3BNToFloatString(new BN(trade.daiAmount), bigNumberTenPow18, 2)
    ),
    token: {
      ...trade.token,
      ...apiResponseToIdeaToken(trade.token, trade.token.market, owner),
    },
    market: apiResponseToIdeaMarket(trade.token.market),
  }
}

async function getLockedEntriesFromWeb3({
  tokenAddress,
  ownerAddress,
  isL1,
}: {
  tokenAddress: string
  ownerAddress: string
  isL1: boolean
}) {
  const contract = isL1
    ? getIdeaTokenVaultContractForL1()
    : getIdeaTokenVaultContract()
  return contract.methods
    .getLockedEntries(
      tokenAddress,
      ownerAddress,
      100 // TODO: make bigger # if people start locking more than 100 times at once
    )
    .call()
}
