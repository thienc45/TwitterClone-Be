import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
config()
interface SignTokenParams {
  payload: string | object | Buffer
  privateKey?: string | Buffer // Private key có thể là string hoặc Buffer
  // options?: jwt.SignOptions
  options?: jwt.SignOptions
}

// export const signToken = ({
//   payload,
//   privateKey = process.env.JWT_SERCET as string, // Sử dụng mặc định từ biến môi trường
//   options = { algorithm: 'HS256' }
// }: SignTokenParams): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     jwt.sign(payload, privateKey, options ?? {}, (err, token) => {
//       if (err) {
//         reject(err)
//         return
//       }
//       resolve(token as string)
//     })
//   })
// }

export const signToken = ({
  payload,
  privateKey = (process.env.JWT_SECRET as string) || '12344321!@#', // Sử dụng mặc định từ biến môi trường
  options = { algorithm: 'HS256' }
}: SignTokenParams): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!privateKey) {
      reject('JWT secret key is missing')
      return
    }

    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        reject(err)
        return
      }
      resolve(token as string)
    })
  })
}

// export default signToken({ payload: {}, options: { algorithm: 'RS256' } })
