import { Router } from 'express'
import { loginController, registerController, verifyEmailController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { wrapRequestHandle } from '~/📂utils/handles'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, wrapRequestHandle(loginController as any))
usersRouter.post('/register', registerValidator as any, wrapRequestHandle(registerController as any))
usersRouter.post(
  '/logout',
  refreshTokenValidator,
  accessTokenValidator,
  wrapRequestHandle((req, res) => {
    res.json({ message: 'Logout successfully' })
  })
)

usersRouter.post('/verify-email', emailVerifyTokenValidator, wrapRequestHandle(verifyEmailController as any))

export default usersRouter
