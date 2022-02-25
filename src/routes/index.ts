import { Router } from 'express'

import { accountRouter } from './account'
import { categoryRouter } from './category'
import { commentsRouter } from './comments'
import { generalRouter } from './general'
import { listingRouter } from './listing'
import { oauthRouter } from './oauth'
import { subgraphRouter } from './subgraph'
import { switchRouter } from './switch'
import { triggerRouter } from './trigger'
import { versionRouter } from './version'
import { votesRouter } from './vote'

const routes = Router()

// Routers
routes.use('/account', accountRouter)
routes.use('/category', categoryRouter)
routes.use('/comments', commentsRouter)
routes.use('/fs', switchRouter)
routes.use('/general', generalRouter)
routes.use('/listing', listingRouter)
routes.use('/oauth', oauthRouter)
routes.use('/subgraph', subgraphRouter)
routes.use('/trigger', triggerRouter)
routes.use('/version', versionRouter)
routes.use('/votes', votesRouter)

export { routes }
