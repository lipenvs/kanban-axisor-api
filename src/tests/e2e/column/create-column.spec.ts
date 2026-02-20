import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { db } from '../../../database/client'
import { makeUser } from '../../factories/make-user'
import { column, user } from '../../../database/schema'
import { makeProject } from '../../factories/make-project'

describe('Create Column', () => {
  afterEach(async () => {
    await db.delete(column)
    await db.delete(user)
  })

  it('should create a column', async () => {
    const { cookie, userId } = await makeUser()
    const title = faker.lorem.word()
    const project = await makeProject(userId)

    const response = await app.handle(
      new Request('http://localhost/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ title, projectId: project.id }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({
      id: expect.any(String),
      title,
      projectId: project.id,
      order: 1
    })
  })
})
