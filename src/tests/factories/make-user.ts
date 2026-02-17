import { faker } from '@faker-js/faker'
import { app } from '../../app'

export async function makeUser() {
  const email = faker.internet.email()
  const password = 'Test1234!'
  const name = faker.person.fullName()

  const response = await app.handle(
    new Request('http://localhost/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })
  )

  const cookie = response.headers.get('set-cookie') ?? ''
  const data = await response.json() as { user: { id: string } }

  return { cookie, userId: data.user.id }
}