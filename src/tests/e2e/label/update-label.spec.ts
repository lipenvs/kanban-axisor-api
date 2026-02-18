import { describe, expect, it } from 'vitest'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeLabel } from '../../factories/make-label'
import { randomUUIDv7 } from 'bun'
import { app } from '../../../app'
import { eq } from 'drizzle-orm'
import { db } from '../../../database/client'
import { faker } from '@faker-js/faker'
import { label } from '../../../database/schema'

describe('Update label', () => {
  it('should update a label', async () => {
    const { cookie, userId } = await makeUser()
    const projectName = randomUUIDv7()
    const projectCreated = await makeProject(userId, projectName)
    const labelCreated = await makeLabel(projectCreated.id)
    const labelColor = faker.color.rgb()

    const response = await app.handle(
      new Request(`http://localhost/labels/${labelCreated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          name: 'updated label name',
          color: labelColor,
        }),
      })
    )

    expect(response.status).toBe(200)

    const labelInDb = await db
      .select()
      .from(label)
      .where(eq(label.id, labelCreated.id))

    expect(labelInDb[0]).toEqual(
      expect.objectContaining({
        name: 'updated label name',
        color: labelColor,
      })
    )
  })
})
