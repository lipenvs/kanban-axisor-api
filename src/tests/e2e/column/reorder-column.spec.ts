import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { db } from '../../../database/client'
import { eq, asc } from 'drizzle-orm'
import { column } from '../../../database/schema'

describe('Reorder Columns', () => {
  it('should reorder columns', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const column1 = await makeColumn(project.id, 0)
    const column2 = await makeColumn(project.id, 1)
    const column3 = await makeColumn(project.id, 2)

    const response = await app.handle(
      new Request('http://localhost/columns/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          activeId: column1.id,
          overId: column3.id,
        }),
      })
    )

    expect(response.status).toBe(200)

    const columns = await db
      .select()
      .from(column)
      .where(eq(column.projectId, project.id))
      .orderBy(asc(column.order))

    expect(columns).toHaveLength(3)

    expect(columns[0].id).toBe(column2.id)
    expect(columns[0].order).toBe(0)

    expect(columns[1].id).toBe(column3.id)
    expect(columns[1].order).toBe(1)

    expect(columns[2].id).toBe(column1.id)
    expect(columns[2].order).toBe(2)
  })

  it('should reorder columns backwards', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const column1 = await makeColumn(project.id, 0)
    const column2 = await makeColumn(project.id, 1)
    const column3 = await makeColumn(project.id, 2)

    const response = await app.handle(
      new Request('http://localhost/columns/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          activeId: column3.id,
          overId: column1.id,
        }),
      })
    )

    expect(response.status).toBe(200)

    const columns = await db
      .select()
      .from(column)
      .where(eq(column.projectId, project.id))
      .orderBy(asc(column.order))

    expect(columns).toHaveLength(3)

    expect(columns[0].id).toBe(column3.id)
    expect(columns[0].order).toBe(0)
    
    expect(columns[1].id).toBe(column1.id)
    expect(columns[1].order).toBe(1)

    expect(columns[2].id).toBe(column2.id)
    expect(columns[2].order).toBe(2)
  })
})
