 
import express from 'express'

import { querySubgraph } from '../controllers/subgraph.controller'
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

export { subgraphRouter }
