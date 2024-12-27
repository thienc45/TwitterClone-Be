import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums/enums'
import HTTP_STATUS from '~/constants/httpStatus/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages/messages'
import User from '~/models/database/User.chema'
import {
  ForgotPasswordReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody
} from '~/models/request/User,request'
import databaseService from '~/services/database.services'
import { usersService } from '~/services/users.services'

export const loginController = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  try {
    const { user }: any = req
    const user_id = user._id.toString()
    const result = await usersService.login({ user_id, verify: UserVerifyStatus.Verified })
    return res.json({
      message: USERS_MESSAGES.LOGIN_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email, password, date_of_birth } = req.body
  try {
    const formattedDateOfBirth = new Date(date_of_birth)
    const result = await usersService.register({ ...req.body, date_of_birth: formattedDateOfBirth.toISOString() })
    return res.json({
      message: USERS_MESSAGES.REGISTER_SUCCESS,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  console.log(
    JSON.stringify(req.decoded_email_verify_token, null, 2) + ' req.decoded_email_verify_token as TokenPayload'
  )
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  console.log(user_id)
  // Nếu không tìm thấy user thì mình sẽ báo lỗi
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // Đã verify rồi thì mình sẽ không báo lỗi
  // Mà mình sẽ trả về status OK với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id, user.email)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id, verify, email } = req.user as User
  const result = await usersService.forgotPassword({ user_id: (_id as ObjectId).toString(), verify, email })
  console.log(result)
  console.log(verify)
  console.log(email)

  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}
