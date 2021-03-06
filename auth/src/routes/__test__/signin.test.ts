import request from 'supertest'
import { app } from '../../app'

it('fails when an email that does not exist is provided', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(400)
})

it('returns 200 when signin was successful', async () => {
  const credentials = {
    email: 'test@test.com',
    password: 'password',
  }
  await request(app).post('/api/users/signup').send(credentials).expect(201)

  const response = await request(app)
    .post('/api/users/signin')
    .send(credentials)
    .expect(200)

  expect(response.get('Set-Cookie')).toBeDefined()
})

it('fails when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201)

  await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'not_valid_password',
    })
    .expect(400)
})
