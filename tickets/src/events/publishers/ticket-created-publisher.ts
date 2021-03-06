import { Publisher, Subjects, TicketCreatedEvent } from '@agrticketing/common'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
