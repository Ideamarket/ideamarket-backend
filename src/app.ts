/* eslint-disable @typescript-eslint/no-floating-promises */
import config from 'config'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { connectMongoDB } from './db/mongodb'
import { commentsRouter } from './routes'

const app = express()

dotenv.config()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// MongoDB
connectMongoDB()

// Routers
app.use('/comments', commentsRouter)

const port: number = config.get('server.port')
app.listen(port, () => {
  console.log(`Server listing at port ${port}`)
})
