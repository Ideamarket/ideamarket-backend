import { Router } from 'express'

import { commentsRouter } from './comments'

const routes = Router()

// Routers
routes.use('/comments', commentsRouter)

export { routes }
