import { NextFunction, Request, RequestHandler, Response } from 'express'

export const wrapRequestHandle = (func: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve()
    //   .then(() => func(req, res, next))
    //   .catch(next)
    try {
      func(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
