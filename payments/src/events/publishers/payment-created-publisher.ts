import { PaymentCreatedEvent, Publisher, Subjects } from '@agrticketing/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
