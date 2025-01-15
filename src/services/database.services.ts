import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import { envConfig } from '~/constants/config'
import Bookmark from '~/models/database/Bookmark.schema'
import Conversation from '~/models/database/Conversations.schema'
import Follower from '~/models/database/Follower.schema'
import Hashtag from '~/models/database/Hashtag.schema'
import Like from '~/models/database/Like.schema'
import User from '~/models/database/User.chema'
import VideoStatus from '~/models/database/VideoStatus.schema'
import RefreshToken from '~/models/request/RefreshToken.schema'
import Tweet from '~/models/schemas/Tweet.schema'
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

  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])

    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }
  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }
  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(['name_1'])

    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }
  async indexFollowers() {
    const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(['content_text'])
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, { default_language: 'none' })
    }
  }
  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(envConfig.dbTweetsCollection)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(envConfig.dbFollowersCollection)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(envConfig.dbVideoStatusCollection)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(envConfig.dbHashtagsCollection)
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(envConfig.dbBookmarksCollection)
  }
  get likes(): Collection<Like> {
    return this.db.collection(envConfig.dbLikesCollection)
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection(envConfig.dbConversationCollection)
  }
}

const databaseService = new DatabaseService()
export default databaseService
