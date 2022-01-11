import { Router } from 'express'

import { commentsRouter } from './comments'
import { userAccountsRouter } from './user-accounts'
import { versionRouter } from './version'
import { votesRouter } from './vote'

const routes = Router()

// Routers
routes.use('/version', versionRouter)
routes.use('/comments', commentsRouter)
routes.use('/votes', votesRouter)
routes.use('/userAccounts', userAccountsRouter)

export { routes }
