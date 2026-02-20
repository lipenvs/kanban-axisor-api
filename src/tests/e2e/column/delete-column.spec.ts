import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { db } from '../../../database/client'
import { eq } from 'drizzle-orm'
import { column, user } from '../../../database/schema'

describe('Delete Column', () => {
  afterEach(async () => {
    await db.delete(column)
    await db.delete(user)
  })

  it('should delete a column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const columnCreated = await makeColumn(project.id)

    const response = await app.handle(
      new Request(`http://localhost/columns/${columnCreated.id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      })
    )

    expect(response.status).toBe(200)

    const columnInDb = await db.select().from(column).where(eq(column.id, columnCreated.id))
    expect(columnInDb[0]).toBeUndefined()
  })
})
