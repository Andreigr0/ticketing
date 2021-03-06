import mongoose from 'mongoose'

interface TicketInput {
  title: string
  price: number
  userId: string
}

interface TicketOutput extends mongoose.Document {
  title: string
  price: number
  userId: string
  version: number
  orderId?: string
}

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    orderId: { type: String, required: false },
  },
  {
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        // delete ret.__v
      },
    },
  }
)

class Ticket extends mongoose.model<TicketOutput>('Ticket', ticketSchema) {
  constructor(attrs: TicketInput) {
    super(attrs)
  }
}

export { Ticket }
