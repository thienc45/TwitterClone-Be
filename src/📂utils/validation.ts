// import express from 'express'
// import { ValidationChain, validationResult } from 'express-validator'
// import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
// import HTTP_STATUS from '~/constants/httpStatus/httpStatus'
// import { EntityError, ErrorWithStatus } from '~/models/Error'
// // import { ErrorWithStatus } from './../models/Error'

// export const validate = (validation: RunnableValidationChains<ValidationChain>): express.RequestHandler => {
//   return async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
//     await validation.run(req)
//     const errors = validationResult(req)
//     if (errors.isEmpty()) {
//       return next()
//     }
//     // Nếu mà không có lỗi thì next
//     const errorObject = errors.mapped()
//     const entityError = new EntityError({ errors: {} })
//     for (const key in errorObject) {
//       const { msg } = errorObject[key]
//       // loi khong tra  ve validation
//       if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
//         return next(msg)
//       }
//       entityError.errors[key] = msg
//     }

//     // res.status(422).json({ errors: errorObject })
//     //loi khong tra ve
//     next(entityError)
//   }
// }

import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import HTTP_STATUS from '~/constants/httpStatus/httpStatus'
import { EntityError, ErrorWithStatus } from '~/models/Error'

// can be reused by many routes

// sequential processing, stops running validations chain if the previous one fails.
export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validation.run(req)
    const errors = validationResult(req)
    // Không có lỗi thì next tiếp tục request
    if (errors.isEmpty()) {
      return next()
    }

    const errorsObject = errors.mapped()
    const entityError = new EntityError({ errors: {} })
    for (const key in errorsObject) {
      const { msg } = errorsObject[key]
      // Trả về lỗi không phải là lỗi do validate
      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg)
      }
      entityError.errors[key] = errorsObject[key]
    }

    next(entityError)
  }
}
