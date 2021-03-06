import { Listener, OrderCreatedEvent, Subjects } from '@agrticketing/common'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queues/expiration-queue'
import { queueGroupName } from './queue-group-name'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName: string = queueGroupName

  async onMessage(
    data: OrderCreatedEvent['data'],
    msg: Message
  ): Promise<void> {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    console.log('Waiting this many milliseconds to process the job:', delay)

    await expirationQueue.add({ orderId: data.id }, { delay })
    msg.ack()
  }
}
