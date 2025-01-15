import dotenv, { config } from 'dotenv'
import express from 'express'
import usersRouter from '~/routes/users.routes'
import { createRandomUser } from '~/📂utils/fake'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import bookmarksRouter from './routes/bookmarks.routes'
import { mediasRouter } from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import databaseService from './services/database.services'
import '~/utils/fake'

config()
const app = express()
databaseService.connect().then(() => {
  databaseService.indexUsers()
  databaseService.indexRefreshTokens()
  databaseService.indexVideoStatus()
  databaseService.indexFollowers()
  databaseService.indexTweets()
})
const port = 40000
// Define the root route
// app.post('/', (req, res) => {
//   res.send('Hello, World!')
// })
const newUser = createRandomUser()
console.log(newUser)

app.use(express.json())
// Use the users router
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)
// app.use('/likes', likesRouter)
// app.use('/search', searchRouter)
// app.use('/conversations', conversationsRouter)
// databaseService.connect()

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
// app.use(defaultErrorHandler as any)

dotenv.config()
