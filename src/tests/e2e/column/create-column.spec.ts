import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'

describe('Create Column', () => {
  it('should create a column', async () => {
    const { cookie, userId } = await makeUser()
    const result = await makeProject(userId)
    const title = faker.lorem.word()

    const response = await app.handle(
      new Request('http://localhost/columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ title, projectId: result.id }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual(expect.objectContaining({
      id: expect.any(String),
      title,
      projectId: result.id,
      order: 0,
    }))
  })
})
