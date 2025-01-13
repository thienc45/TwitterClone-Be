import { Router } from 'express'
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { UpdateMeReqBody } from '~/models/request/User,request'
import { wrapRequestHandle } from '~/📂utils/handles'

const usersRouter = Router()
usersRouter.post('/login', loginValidator, wrapRequestHandle(loginController as any))
usersRouter.post('/register', registerValidator, wrapRequestHandle(registerController as any))
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

usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandle(verifyForgotPasswordController as any)
)
usersRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandle(refreshTokenController as any))

usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandle(resetPasswordController as any))

usersRouter.get('/me', accessTokenValidator, wrapRequestHandle(getMeController as any))

usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandle(updateMeController as any)
)

usersRouter.get('/:username', wrapRequestHandle(getProfileController as any))

/**
 * Description: Follow someone
 * Path: /follow
 * Method: POST
 * Header: { Authorization: Bearer <access_token> }
 * Body: { followed_user_id: string }
 */
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followValidator,
  wrapRequestHandle(followController as any)
)

usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowValidator,
  wrapRequestHandle(unfollowController as any)
)

usersRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandle(changePasswordController as any)
)

usersRouter.get('/oauth/google', wrapRequestHandle(oauthController as any))

export default usersRouter
