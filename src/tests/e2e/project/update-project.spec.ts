import { describe, expect, it } from 'vitest'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { app } from '../../../app'
import { eq } from 'drizzle-orm'
import { db } from '../../../database/client'
import { project } from '../../../database/schema'

describe('Update project', () => {
  it('should update a project', async () => {
    const { cookie, userId } = await makeUser()
    const projectName = crypto.randomUUID()
    const projectCreated = await makeProject(userId, projectName)

    const response = await app.handle(
      new Request(`http://localhost/projects/${projectCreated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          name: 'new name',
        }),
      })
    )

    expect(response.status).toBe(200)

    const projectInDb = await db
      .select()
      .from(project)
      .where(eq(project.id, projectCreated.id))

    expect(projectInDb[0]).toEqual(
      expect.objectContaining({
        name: 'new name',
      })
    )
  })
})
