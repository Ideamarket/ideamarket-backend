/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  cloneOnChainListingsToWeb2,
  querySubgraph,
} from '../controllers/subgraph.controller'
import { validateRequest } from '../middleware/validateRequest'
import { querySubgraphValidation } from '../validations/subgraph.validation'

const subgraphRouter = express.Router()

// -------------------- ROUTES -------------------- //

// Query subgraph
subgraphRouter.post(
  '/query',
  querySubgraphValidation,
  validateRequest,
  querySubgraph
)

subgraphRouter.post('/cloneToWeb2', cloneOnChainListingsToWeb2)

export { subgraphRouter }
