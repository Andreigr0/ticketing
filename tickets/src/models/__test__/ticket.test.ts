import { Ticket } from '../ticket'

it('should implement optimistic concurrency control', async () => {
  const ticket = new Ticket({
    title: 'concert',
    price: 4,
    userId: '123',
  })
  await ticket.save()

  const firstInstance = await Ticket.findById(ticket.id)
  const secondInstance = await Ticket.findById(ticket.id)

  firstInstance!.set({ price: 10 })
  secondInstance!.set({ price: 15 })

  await firstInstance!.save()

  await expect(secondInstance!.save()).rejects.toThrow()
})

it('should increment the version number on multiple saves', async () => {
  const ticket = new Ticket({
    title: 'concert',
    price: 20,
    userId: '123',
  })

  await ticket.save()
  expect(ticket.version).toEqual(0)

  ticket.set({ title: 'concert...' })
  await ticket.save()
  expect(ticket.version).toEqual(1)

  ticket.set({ title: 'concert' })
  await ticket.save()
  expect(ticket.version).toEqual(2)
})
