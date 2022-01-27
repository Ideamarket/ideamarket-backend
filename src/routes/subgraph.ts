import express from 'express'

import {
  migrateSubgraphToListings,
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

// eslint-disable-next-line @typescript-eslint/no-misused-promises
subgraphRouter.post('/migrate', migrateSubgraphToListings)

export { subgraphRouter }
