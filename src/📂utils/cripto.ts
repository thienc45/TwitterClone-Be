import { config } from 'dotenv'
import { createHash } from 'node:crypto'

config()
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

export function hashPassWord(passsword: string) {
  return sha256(passsword + process.env.PASSWORD_SECRET)
}
