import dotenv, { config } from 'dotenv'
import express from 'express'
import usersRouter from '~/routes/users.routes'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import databaseService from './services/database.services'

config()
const app = express()
const port = 40000

// Define the root route
// app.post('/', (req, res) => {
//   res.send('Hello, World!')
// })

app.use(express.json())
// Use the users router
app.use('/users', usersRouter)
databaseService.connect()

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
app.use(defaultErrorHandler)

dotenv.config()
