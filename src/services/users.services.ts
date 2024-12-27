import { config } from 'dotenv'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { envConfig } from '~/constants/config'
import { TokenType, UserVerifyStatus } from '~/constants/enums/enums'
import { USERS_MESSAGES } from '~/constants/messages/messages'
import User from '~/models/database/User.chema'
import RefreshToken from '~/models/request/RefreshToken.schema'
import { RegisterReqBody } from '~/models/request/User,request'
import databaseService from '~/services/database.services'
import { hashPassWord } from '~/📂utils/cripto'
import { sendVerifyRegisterEmail } from '~/📂utils/email'
import { verifyToken } from '~/📂utils/jwt'
import { signToken } from '~/📂utils/utils'
import { validate } from '~/📂utils/validation'
config()

class UsersService {
  private signAccesToken(user_id: string) {
    return signToken({ payload: { user_id, token_type: TokenType.AccessToken }, options: { expiresIn: '10m' } })
  }

  private signRefeshToken(user_id: string) {
    return signToken({ payload: { user_id, token_type: TokenType.RefreshToken }, options: { expiresIn: '11d' } })
  }

  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },

      privateKey: envConfig.jwtSecretForgotPasswordToken,
      options: {
        expiresIn: envConfig.forgotPasswordTokenExpiresIn
      }
    })
  }

  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: envConfig.jwtSecretAccessToken,
      options: {
        expiresIn: envConfig.accessTokenExpiresIn
      }
    })
  }

  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccesToken(user_id), this.signRefeshToken(user_id)])
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: envConfig.jwtSecretEmailVerifyToken,
      options: {
        expiresIn: envConfig.emailVerifyTokenExpiresIn
      }
    })
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified
    })

    try {
      const { name, email, password, date_of_birth } = payload

      await databaseService.users.insertOne(
        new User({
          ...payload,
          _id: user_id,
          email_verify_token,
          date_of_birth: new Date(payload.date_of_birth),
          password: hashPassWord(payload.password)
        })
      )

      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user_id.toString(),
        verify: UserVerifyStatus.Unverified
      })

      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          user_id: new ObjectId(user_id),
          token: refresh_token,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 11 * 24 * 60 * 60
        })
      )

      return { access_token, refresh_token, email_verify_token }
    } catch (error) {
      throw new Error('Register failed')
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.jwtSecretRefreshToken
    })
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify
    })
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )
    return {
      access_token,
      refresh_token
    }
  }

  accessTokenValidator = validate(
    checkSchema({
      Authorization: {
        isEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]
            if (access_token === '') {
              throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED)
            }
            const user = await databaseService.users.findOne({ access_token })
            if (user === null) {
              throw new Error(USERS_MESSAGES.ACCESS_TOKEN_IS_INVALID)
            }
            req.user = user
            return true
          }
        }
      }
    })
  )

  async verifyEmail(user_id: string) {
    // Tạo giá trị cập nhật
    // MongoDB cập nhật giá trị
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified,
            updated_at: '$$NOW'
          }
        }
      ])
    ])
    const [access_token, refresh_token] = token
    console.log(token)

    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp })
    )

    return {
      access_token,
      refresh_token
    }
  }

  async resendVerifyEmail(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified
    })
    await sendVerifyRegisterEmail(email, email_verify_token)

    // Cập nhật lại giá trị email_verify_token trong document user
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    }
  }

  async forgotPassword({ user_id, verify, email }: { user_id: string; email: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify
    })
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token,
          updated_at: '$$NOW'
        }
      }
    ])
    console.log(forgot_password_token)
    return {
      message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
    }
  }

  async resetPassword(user_id: string, password: string) {
    databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassWord(password as any)
          // password: password
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }
}

export const usersService = new UsersService()
