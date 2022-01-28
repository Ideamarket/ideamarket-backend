/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { fetchUrlMetadata } from '../controllers/general.controller'

const generalRouter = express.Router()

generalRouter.post('/url-metadata', fetchUrlMetadata)

export { generalRouter as genericRouter }
