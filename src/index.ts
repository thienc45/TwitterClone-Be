import cors from 'cors'
import { config } from 'dotenv'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import usersRouter from '~/routes/users.routes'
import { UPLOAD_VIDEO_DIR } from './constants/dir'
import bookmarksRouter from './routes/bookmarks.routes'
import { mediasRouter } from './routes/medias.routes'
import staticRouter from './routes/static.routes'
import tweetsRouter from './routes/tweets.routes'
import databaseService from './services/database.services'

config() // Load environment variables from .env file

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }
})

databaseService.connect().then(() => {
  console.log('Database connected successfully.')
})

const port = 40000

const users: {
  [key: string]: {
    socket_id: string
  }
} = {}

io.on('connection', (socket) => {
  const user_id = socket.handshake.auth?._id
  console.log(user_id)
  if (!user_id) {
    socket.disconnect()
    return
  }
  users[user_id] = { socket_id: socket.id }

  socket.on('private message', (data) => {
    console.log('Private message received:', data)
    const receiverSocketId = users[data.to]?.socket_id
    socket.to(receiverSocketId).emit('receive private message', {
      data: data.content,
      from: user_id
    })
  })

  socket.on('disconnect', () => {
    delete users[user_id]
  })
})
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))
app.use('/tweets', tweetsRouter)
app.use('/bookmarks', bookmarksRouter)

// Start the server
httpServer.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`)
})
