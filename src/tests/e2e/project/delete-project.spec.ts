import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { randomUUIDv7 } from 'bun'
import { eq } from 'drizzle-orm'
import { db } from '../../../database/client'
import { project } from '../../../database/schema'

describe('Delete project', () => {
  it('should delete a project', async () => {
    const { cookie, userId } = await makeUser()
    const projectName = randomUUIDv7()
    const projectCreated = await makeProject(userId, projectName)

    const response = await app.handle(
      new Request(`http://localhost/projects/${projectCreated.id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      })
    )

    expect(response.status).toBe(200)

    const projectInDb = await db
      .select()
      .from(project)
      .where(eq(project.id, projectCreated.id))

    expect(projectInDb[0]).toBeUndefined()
  })
})
