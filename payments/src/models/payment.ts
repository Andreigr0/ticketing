import mongoose from 'mongoose'

interface PaymentAttrs {
  orderId: string
  stripeId: string
}

interface PaymentDoc extends mongoose.Document {
  orderId: string
  stripeId: string
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: { required: true, type: String },
    stripeId: { required: true, type: String },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      },
    },
  },
)

class Payment extends mongoose.model<PaymentDoc>('Payment', paymentSchema) {
  constructor(attrs: PaymentAttrs) {
    super(attrs)
  }
}

export { Payment }
