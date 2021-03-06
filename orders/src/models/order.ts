import mongoose from 'mongoose'
import { OrderStatus } from '@agrticketing/common'
import { TicketOutput } from './ticket'

export { OrderStatus }

interface OrderInput {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketOutput
}

interface OrderOutput extends mongoose.Document {
  userId: string
  status: OrderStatus
  expiresAt: Date
  ticket: TicketOutput
  version: number
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: mongoose.Schema.Types.Date, required: false },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
  },
  {
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
  }
)

class Order extends mongoose.model<OrderOutput>('Order', orderSchema) {
  constructor(attrs: OrderInput) {
    super(attrs)
  }
}

export { Order }
