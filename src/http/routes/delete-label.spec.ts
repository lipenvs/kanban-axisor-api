import { describe, it, expect } from 'vitest'
import { app } from '../../app'
import { makeUser } from '../../tests/factories/make-user'
import { makeProject } from '../../tests/factories/make-project'
import { makeLabel } from '../../tests/factories/make-label'
import { randomUUIDv7 } from 'bun'
import { eq } from 'drizzle-orm'
import { db } from '../../database/client'
import { label } from '../../database/schema'

describe('Delete label', () => {
  it('should delete a label', async () => {
    const { cookie, userId } = await makeUser()
    const projectName = randomUUIDv7()
    const projectCreated = await makeProject(userId, projectName)
    const labelCreated = await makeLabel(projectCreated.id)

    const response = await app.handle(
      new Request(`http://localhost/labels/${labelCreated.id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      })
    )
    
    expect(response.status).toBe(200)

    const labelInDb = await db
      .select()
      .from(label)
      .where(eq(label.id, labelCreated.id))

    expect(labelInDb[0]).toBeUndefined()
  })
})
