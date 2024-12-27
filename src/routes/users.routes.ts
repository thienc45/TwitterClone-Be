import { Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
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

usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandle(resendVerifyEmailController as any))

// feat(auth): implement forgot password endpoint

// - Description: Submit email to reset password
// - Path: /forgot-password
// - Method: POST
// - Request Body: { email: string }
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandle(forgotPasswordController as any))

export default usersRouter
