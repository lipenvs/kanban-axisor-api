import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { db } from '../../../database/client'
import { eq } from 'drizzle-orm'
import { column, user } from '../../../database/schema'

describe('Update Column', () => {
  afterEach(async () => {
    await db.delete(column)
    await db.delete(user)
  })

  it('should update a column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const newColumn = await makeColumn(project.id)

    const response = await app.handle(
      new Request(`http://localhost/columns/${newColumn.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expect.objectContaining({
      id: newColumn.id,
      title: 'Updated Title',
    }))

    const columnInDb = await db.select().from(column).where(eq(column.id, newColumn.id))
    expect(columnInDb[0].title).toBe('Updated Title')
  })
})
