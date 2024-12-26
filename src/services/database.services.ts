import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import User from '~/models/database/User.chema'
import RefreshToken from '~/models/request/RefreshToken.schema'
config()

require('dotenv').config()
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@DuocDevEdu/?retryWrites=true&w=majority&appName=twitter`
const uri =
  'mongodb+srv://doanducthien123:thienczai123@twitter.s7exy.mongodb.net/?retryWrites=true&w=majority&appName=twitter'
console.log(process.env.DB_NAME)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      await this.client.connect() // Kết nối tới MongoDB
      console.log('Connected to MongoDB successfully!')
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      throw error // Ném lỗi để kiểm tra
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
}

const databaseService = new DatabaseService()
export default databaseService
