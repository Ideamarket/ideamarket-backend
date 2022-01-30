import { Router } from 'express'

import { accountRouter } from './account'
import { commentsRouter } from './comments'
import { generalRouter } from './general'
import { listingRouter } from './listing'
import { subgraphRouter } from './subgraph'
import { switchRouter } from './switch'
import { versionRouter } from './version'
import { votesRouter } from './vote'

const routes = Router()

// Routers
routes.use('/version', versionRouter)
routes.use('/comments', commentsRouter)
routes.use('/votes', votesRouter)
routes.use('/account', accountRouter)
routes.use('/fs', switchRouter)
routes.use('/subgraph', subgraphRouter)
routes.use('/listing', listingRouter)
routes.use('/general', generalRouter)

export { routes }
