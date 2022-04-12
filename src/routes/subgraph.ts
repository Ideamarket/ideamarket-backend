/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  cloneNewOnchainListingsToWeb2,
  fetchTrades,
  fetchWalletHoldings,
  querySubgraph,
} from '../controllers/subgraph.controller'
import { authenticateAndSetAccount } from '../middleware/authentication'
import { authorizeAdmin } from '../middleware/authorization'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchTradesValidation,
  fetchWalletHoldingsValidation,
  querySubgraphValidation,
} from '../validations/subgraph.validation'

const subgraphRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Query subgraph
subgraphRouter.post(
  '/query',
  querySubgraphValidation,
  validateRequest,
  querySubgraph
)

subgraphRouter.post(
  '/cloneToWeb2',
  authenticateAndSetAccount,
  authorizeAdmin,
  cloneNewOnchainListingsToWeb2
)

// Fetch Wallet Holdings
subgraphRouter.get(
  '/walletHoldings',
  fetchWalletHoldingsValidation,
  validateRequest,
  fetchWalletHoldings
)

// Fetch Trades
subgraphRouter.get(
  '/trades',
  fetchTradesValidation,
  validateRequest,
  fetchTrades
)

export { subgraphRouter }
