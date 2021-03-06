import { OrderStatus } from '@agrticketing/common'
import mongoose from 'mongoose'

interface OrderInput {
  id?: string
  userId: string
  status: OrderStatus
  version: number
  price: number
}

interface OrderOutput extends mongoose.Document {
  userId: string
  status: OrderStatus
  version: number
  price: number
}

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },
    price: { type: Number, required: true },
  },
  {
    optimisticConcurrency: true,
    versionKey: 'version',
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  },
)

class Order extends mongoose.model<OrderOutput>('Order', orderSchema) {
  constructor(attrs: OrderInput) {
    const { ...destrAttrs } = attrs

    if (destrAttrs.id) {
      const id = destrAttrs.id
      delete destrAttrs.id
      super({ _id: id, ...destrAttrs })
    } else {
      super(attrs)
    }
  }
}

export { Order }
