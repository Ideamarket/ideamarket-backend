import { Router } from 'express'

import { commentsRouter } from './comments'
import { votesRouter } from './vote'

const routes = Router()

// Routers
routes.use('/comments', commentsRouter)
routes.use('/votes', votesRouter)

export { routes }
