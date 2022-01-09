/* eslint-disable @typescript-eslint/no-floating-promises */
import config from 'config'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

import { connectMongoDB } from './db/mongodb'
import { routes } from './routes'

const app = express()

dotenv.config()

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// MongoDB
connectMongoDB()

// Routers
app.use(routes)

const port: number = config.get('server.port')
app.listen(port, () => {
  console.log(`Server listing at port ${port}`)
})
