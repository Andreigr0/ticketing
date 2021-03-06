import { Publisher, Subjects, TicketUpdatedEvent } from '@agrticketing/common'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
