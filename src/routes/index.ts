import { Router } from 'express'

import { accountRouter } from './account'
import { avatarRouter } from './avatar'
import { categoryRouter } from './category'
import { commentsRouter } from './comments'
import { generalRouter } from './general'
import { listingRouter } from './listing'
import { opinionRouter } from './opinion'
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
routes.use('/opinion', opinionRouter)
routes.use('/subgraph', subgraphRouter)
routes.use('/trigger', triggerRouter)
routes.use('/version', versionRouter)
routes.use('/votes', votesRouter)
routes.use('/avatar', avatarRouter)

export { routes }
