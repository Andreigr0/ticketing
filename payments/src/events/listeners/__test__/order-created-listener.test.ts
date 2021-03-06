import { OrderCreatedEvent, OrderStatus } from '@agrticketing/common'
import mongoose from 'mongoose'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { Message } from 'node-nats-streaming'
import { Order } from '../../../models/order'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'adsfsadf',
    userId: 'asdfadf',
    status: OrderStatus.Created,
    ticket: {
      id: 'adfasdf',
      price: 10,
    },
  }

  // @ts-ignore
  const msg: Message = { ack: jest.fn() }

  return { listener, data, msg }
}

it('should replicate the order info', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const order = await Order.findById(data.id)
  expect(order?.price).toEqual(data.ticket.price)
})

it('should ack the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})