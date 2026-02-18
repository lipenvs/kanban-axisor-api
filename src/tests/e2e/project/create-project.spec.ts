import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { db } from '../../../database/client'
import { makeUser } from '../../factories/make-user'
import { project, user } from '../../../database/schema'

describe('Create Project', () => {
  afterEach(async () => {
    await db.delete(project)
    await db.delete(user)
  })

  it('should create a project', async () => {
    const { cookie } = await makeUser()
    const name = faker.lorem.word()

    const response = await app.handle(
      new Request('http://localhost/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ name }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({ id: expect.any(String), name })
  })
})
