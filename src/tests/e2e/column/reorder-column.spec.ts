import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { db } from '../../../database/client'
import { eq, asc } from 'drizzle-orm'
import { column } from '../../../database/schema'

describe('Save Column Positions', () => {
  it('should save column positions (new order: col2, col1, col3)', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const column1 = await makeColumn(project.id, 0)
    const column2 = await makeColumn(project.id, 1)
    const column3 = await makeColumn(project.id, 2)

    const response = await app.handle(
      new Request('http://localhost/columns/positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          projectId: project.id,
          columnIds: [column2.id, column1.id, column3.id],
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
    expect(columns[1].id).toBe(column1.id)
    expect(columns[2].id).toBe(column3.id)
  })

  it('should save column positions (new order: col3, col1, col2)', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const column1 = await makeColumn(project.id, 0)
    const column2 = await makeColumn(project.id, 1)
    const column3 = await makeColumn(project.id, 2)

    const response = await app.handle(
      new Request('http://localhost/columns/positions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          projectId: project.id,
          columnIds: [column3.id, column1.id, column2.id],
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
    expect(columns[1].id).toBe(column1.id)
    expect(columns[2].id).toBe(column2.id)
  })
})
