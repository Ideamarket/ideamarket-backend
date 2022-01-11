/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express'

import { fetchVersion } from '../controllers/version.controller'

const versionRouter = express.Router()

versionRouter.get('', fetchVersion)

export { versionRouter }
