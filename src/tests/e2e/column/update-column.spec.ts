import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { db } from '../../../database/client'
import { eq } from 'drizzle-orm'
import { column } from '../../../database/schema/column'

describe('Update Column', () => {
  it('should update a column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const columnCreated = await makeColumn(project.id)

    const response = await app.handle(
      new Request(`http://localhost/columns/${columnCreated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          title: 'Updated Title',
          order: 2,
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expect.objectContaining({
      id: columnCreated.id,
      title: 'Updated Title',
      order: 2,
    }))

    const columnInDb = await db.select().from(column).where(eq(column.id, columnCreated.id))
    expect(columnInDb[0].title).toBe('Updated Title')
    expect(columnInDb[0].order).toBe(2)
  })
})
