import { afterEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import { db } from '../../../database/client'
import { task, column, user } from '../../../database/schema'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { makeTask } from '../../factories/make-task'
import { app } from '../../../app'

describe('Reorder Tasks', () => {
  afterEach(async () => {
    await db.delete(task)
    await db.delete(column)
    await db.delete(user)
  })

  it('should reorder tasks within the same column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const col = await makeColumn(project.id)

    const task1 = await makeTask(col.id) // order: 1
    const task2 = await makeTask(col.id) // order: 2
    const task3 = await makeTask(col.id) // order: 3

    // Inverte: task3, task1, task2
    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          tasks: [
            { id: task3.id, columnId: col.id, order: 1 },
            { id: task1.id, columnId: col.id, order: 2 },
            { id: task2.id, columnId: col.id, order: 3 },
          ],
        }),
      })
    )

    expect(response.status).toBe(200)

    const [updated1, updated2, updated3] = await Promise.all([
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task1.id)),
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task2.id)),
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task3.id)),
    ])

    expect(updated3[0].order).toBe(1)
    expect(updated1[0].order).toBe(2)
    expect(updated2[0].order).toBe(3)
  })

  it('should move a task to another column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const colA = await makeColumn(project.id)
    const colB = await makeColumn(project.id)

    const task1 = await makeTask(colA.id) // order: 1 em colA
    const task2 = await makeTask(colA.id) // order: 2 em colA
    const task3 = await makeTask(colB.id) // order: 1 em colB

    // Move task2 de colA para colB
    // colA fica: [task1]
    // colB fica: [task2, task3]
    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          tasks: [
            { id: task1.id, columnId: colA.id, order: 1 },
            { id: task2.id, columnId: colB.id, order: 1 },
            { id: task3.id, columnId: colB.id, order: 2 },
          ],
        }),
      })
    )

    expect(response.status).toBe(200)

    const [updated1, updated2, updated3] = await Promise.all([
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task1.id)),
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task2.id)),
      db.select({ order: task.order, columnId: task.columnId }).from(task).where(eq(task.id, task3.id)),
    ])

    expect(updated1[0]).toEqual({ order: 1, columnId: colA.id })
    expect(updated2[0]).toEqual({ order: 1, columnId: colB.id })
    expect(updated3[0]).toEqual({ order: 2, columnId: colB.id })
  })

  it('should return 401 when not authenticated', async () => {
    const { userId } = await makeUser()
    const project = await makeProject(userId)
    const col = await makeColumn(project.id)
    const t = await makeTask(col.id)

    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: [{ id: t.id, columnId: col.id, order: 1 }],
        }),
      })
    )

    expect(response.status).toBe(401)
  })

  it('should return 422 when body is invalid', async () => {
    const { cookie } = await makeUser()

    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ tasks: [{ id: 'not-a-uuid', columnId: 'not-a-uuid', order: 1 }] }),
      })
    )

    expect(response.status).toBe(422)
  })
})