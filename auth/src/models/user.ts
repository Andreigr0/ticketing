import mongoose from 'mongoose'
import { Password } from '../services/password'

interface UserInput {
  email: string
  password: string
}

interface UserOutput extends mongoose.Document {
  email: string
  password: string
  //   createdAt: string
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      },
    },
  }
)

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

const UserModel = mongoose.model<UserOutput>('User', userSchema)

class User extends UserModel {
  constructor(attrs: UserInput) {
    super(attrs)
  }
}

export { User }
