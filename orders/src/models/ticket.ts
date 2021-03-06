import mongoose from 'mongoose'
import { Order, OrderStatus } from './order'

interface TicketInput {
  id?: string
  title: string
  price: number
}

export interface TicketOutput extends mongoose.Document {
  title: string
  price: number
  version: number
  isReserved(): Promise<boolean>
}

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
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

// ticketSchema.pre('save', function (done) {
//   this.$where = {
//     version: this.get('version') - 1,
//     //
//   }

//   done()
// })

class Ticket extends mongoose.model<TicketOutput>('Ticket', ticketSchema) {
  constructor(attrs: TicketInput) {
    const { ...destrAttrs } = attrs

    if (destrAttrs.id) {
      const id = destrAttrs.id
      delete destrAttrs.id
      super({ _id: id, ...destrAttrs })
    } else {
      super(attrs)
    }
  }

  static async findByEvent(event: {
    id: string
    version: number
  }): Promise<TicketOutput | null> {
    const ticket = await Ticket.findOne({
      _id: event.id,
      version: event.version - 1,
    })
    
    return ticket;
  }

  async isReserved(): Promise<boolean> {
    const existingOrder = await Order.findOne({
      ticket: this,
      status: {
        $in: [
          OrderStatus.Created,
          OrderStatus.AwaitingPayment,
          OrderStatus.Complete,
        ],
      },
    })

    return !!existingOrder
  }
}

export { Ticket }
