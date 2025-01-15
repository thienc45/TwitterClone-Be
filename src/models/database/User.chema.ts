import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums/enums'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at?: Date
  updated_at?: Date
  email_verify_token?: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token?: string // jwt hoặc '' nếu đã xác thực email
  verify?: UserVerifyStatus
  twitter_circle?: ObjectId[]

  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string
  forgot_password_token: string
  verify: UserVerifyStatus
  twitter_circle: ObjectId[] // danh sách id của những người user này add vào circle

  bio: string
  location: string
  website: string
  username: string
  avatar: string
  cover_photo: string

  constructor(user: UserType) {
    this._id = user._id
    this.name = user.name || 'Unknown User'
    this.email = user.email
    this.date_of_birth = user.date_of_birth || new Date(0) // Ngày mặc định nếu không có
    this.password = user.password
    this.created_at = user.created_at || new Date() // Gán ngày hiện tại nếu không có
    this.updated_at = user.updated_at || new Date() // Gán ngày hiện tại nếu không có
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify ?? UserVerifyStatus.Unverified // Mặc định là chưa xác thực
    this.date_of_birth = user.date_of_birth || new Date() // Ensure date_of_birth is always a Date
    this.twitter_circle = user.twitter_circle || []

    // Optional fields
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }
}
