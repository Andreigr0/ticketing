import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../../models/order'
import { Ticket } from '../../../models/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from '../expiration-complete-listener'
import { Message } from 'node-nats-streaming'
import { ExpirationCompleteEvent } from '@agrticketing/common'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)

  const ticket = new Ticket({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })
  await ticket.save()

  const order = new Order({
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date(),
    ticket: ticket,
    status: OrderStatus.Created,
  })

  await order.save()

  const data: ExpirationCompleteEvent['data'] = { orderId: order.id }

  // @ts-ignore
  const msg: Message = { ack: jest.fn() }

  return { ticket, order, listener, data, msg }
}

it('should update the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('should emit an OrderCancelled event', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(eventData.id).toEqual(order.id)
})

it('should ack the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)

  expect(msg.ack).toHaveBeenCalled()
})