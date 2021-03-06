import { Listener, Subjects, TicketUpdatedEvent } from '@agrticketing/common'
import { Message } from 'node-nats-streaming'
import { Ticket } from '../../models/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName: string = queueGroupName

  async onMessage(
    data: TicketUpdatedEvent['data'],
    msg: Message
  ): Promise<void> {
    const ticket = await Ticket.findByEvent(data)

    if (!ticket) {
      throw new Error('Ticket not found')
    }

    const { title, price } = data
    ticket.set({ title, price })
    ticket.markModified('title', 'price')
    await ticket.save()

    msg.ack()
  }
}
