import { OrderCreatedEvent, Publisher, Subjects } from '@agrticketing/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
