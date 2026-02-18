import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { db } from '../../../database/client'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { project } from '../../../database/schema/project'
import { user } from '../../../database/schema/user'

describe('Create Label', () => {
  afterEach(async () => {
    await db.delete(project)
    await db.delete(user)
  })

  it('should create a label', async () => {
    const { cookie, userId } = await makeUser()
    const name = faker.lorem.word()
    const color = faker.color.rgb()

    const projectCreated = await makeProject(userId)

    const response = await app.handle(
      new Request('http://localhost/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          name,
          color,
          projectId: projectCreated.id
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({ id: expect.any(String), name, color })
  })
})
