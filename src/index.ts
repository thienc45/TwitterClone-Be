import dotenv, { config } from 'dotenv'
import express from 'express'
import usersRouter from '~/routes/users.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { mediasRouter } from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import databaseService from './services/database.services'

config()
const app = express()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  // databaseService.indexTweets()
})
const port = 40000

// Define the root route
// app.post('/', (req, res) => {
//   res.send('Hello, World!')
// })

app.use(express.json())
// Use the users router
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

// databaseService.connect()

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
app.use(defaultErrorHandler as any)

dotenv.config()
