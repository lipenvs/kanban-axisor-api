import { afterEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import { db } from '../../../database/client'
import { column, user } from '../../../database/schema'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { app } from '../../../app'

describe('Reorder Columns', () => {
  afterEach(async () => {
    await db.delete(column)
    await db.delete(user)
  })

  it('should reorder columns', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const col1 = await makeColumn(project.id) // order: 1
    const col2 = await makeColumn(project.id) // order: 2
    const col3 = await makeColumn(project.id) // order: 3

    // Inverte a ordem: col3, col1, col2
    const response = await app.handle(
      new Request('http://localhost/columns/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          columns: [
            { id: col3.id, order: 1 },
            { id: col1.id, order: 2 },
            { id: col2.id, order: 3 },
          ],
        }),
      })
    )

    expect(response.status).toBe(200)

    const [updated1, updated2, updated3] = await Promise.all([
      db.select({ order: column.order }).from(column).where(eq(column.id, col1.id)),
      db.select({ order: column.order }).from(column).where(eq(column.id, col2.id)),
      db.select({ order: column.order }).from(column).where(eq(column.id, col3.id)),
    ])

    expect(updated3[0].order).toBe(1)
    expect(updated1[0].order).toBe(2)
    expect(updated2[0].order).toBe(3)
  })

  it('should return 401 when not authenticated', async () => {
    const { userId } = await makeUser()
    const project = await makeProject(userId)
    const col1 = await makeColumn(project.id)

    const response = await app.handle(
      new Request('http://localhost/columns/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: [{ id: col1.id, order: 1 }],
        }),
      })
    )

    expect(response.status).toBe(401)
  })

  it('should return 422 when body is invalid', async () => {
    const { cookie } = await makeUser()

    const response = await app.handle(
      new Request('http://localhost/columns/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ columns: [{ id: 'not-a-uuid', order: 1 }] }),
      })
    )

    expect(response.status).toBe(422)
  })
})