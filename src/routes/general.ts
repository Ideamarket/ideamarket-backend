/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import {
  fetchLatestApr,
  fetchUrlMetadata,
} from '../controllers/general.controller'

const generalRouter = express.Router()

generalRouter.post('/url-metadata', fetchUrlMetadata)
generalRouter.get('/apr', fetchLatestApr)

export { generalRouter }
