import { Server as ServerHttp } from 'http'
import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'

import { UserVerifyStatus } from '~/constants/enums/enums'
import HTTP_STATUS from '~/constants/httpStatus/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages/messages'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/request/User,request'
import Conversation from '~/models/schemas/Conversations.schema'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from './commons'

const initSocket = (httpServer: ServerHttp) => {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các method cho phép
      allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
      credentials: true // Cho phép gửi cookie và xác thực
    }
  })
  const users: {
    [key: string]: {
      socket_id: string
    }
  } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const access_token = Authorization?.split(' ')[1]
    try {
      const decoded_authorization = await verifyAccessToken(access_token)
      const { verify } = decoded_authorization as TokenPayload
      if (verify !== UserVerifyStatus.Verified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_VERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        })
      }
      // Truyền decoded_authorization vào socket để sử dụng ở các middleware khác
      socket.handshake.auth.decoded_authorization = decoded_authorization
      socket.handshake.auth.access_token = access_token
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })
  io.on('connection', (socket) => {
    console.log(`user ${socket.id} connected`)
    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload
    users[user_id] = {
      socket_id: socket.id
    }

    console.log('Current online users:', users)

    socket.use(async (packet, next) => {
      const { access_token } = socket.handshake.auth
      try {
        await verifyAccessToken(access_token)
        next()
      } catch (error) {
        next(new Error('Unauthorized'))
      }
    })

    socket.on('error', (error) => {
      if (error.message === 'Unauthorized') {
        socket.disconnect()
      }
    })
    socket.on('send_message', async (data) => {
      const { receiver_id, sender_id, content } = data.payload
      const receiver_socket_id = users[receiver_id]?.socket_id

      console.log('Receiver socket ID:', receiver_socket_id)

      const conversation = new Conversation({
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
        content: content
      })
      console.log(conversation)
      const result = await databaseService.conversations.insertOne(conversation)

      conversation._id = result.insertedId
      socket.emit('send_message_success', {
        payload: conversation
      })
      if (receiver_socket_id) {
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: conversation
        })
      }
    })
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`user ${socket.id} disconnected`)
    })
  })
}

export default initSocket
