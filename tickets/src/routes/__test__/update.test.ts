import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '../../app'
import { Ticket } from '../../models/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('returns a 404 if the provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(401)
})

it('returns a 401 if the user does not own the ticket', async () => {
  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', global.signin())
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(201)

  const ticket = await Ticket.findById(response.body.id)
  expect(ticket).not.toBeNull()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'upd',
      price: 25,
    })
    .expect(401)
})

it('returns a 401 if the user provides an invalid title or price', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(201)

  let ticket = await Ticket.findById(response.body.id)
  expect(ticket).not.toBeNull()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 25 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'title', price: -10 })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({})
    .expect(400)
})

it('updates the ticket provided valid inputs', async () => {
  const cookie = global.signin()

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(201)

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'upd', price: 25 })
    .expect(200)

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200)

  expect(ticketResponse.body.title).toEqual('upd')
  expect(ticketResponse.body.price).toEqual(25)
})

it('publishes an event', async () => {
  const title = 'title'
  const price = 20

  const cookie = global.signin()

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(201)

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200)

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'upd', price: 25 })
    .expect(200)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})

it('should reject update if the ticket is reserved', async () => {
  const title = 'title'
  const price = 20

  const cookie = global.signin()

  const response = await request(app)
    .post(`/api/tickets`)
    .set('Cookie', cookie)
    .send({
      title: 'adadk',
      price: 20,
    })
    .expect(201)

  await request(app).get(`/api/tickets/${response.body.id}`).send().expect(200)

  const ticket = await Ticket.findById(response.body.id)
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() })
  await ticket!.save()

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'upd', price: 25 })
    .expect(400)
})