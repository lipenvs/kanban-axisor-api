import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { makeLabel } from '../../factories/make-label'
import { makeTask } from '../../factories/make-task'
import { db } from '../../../database/client'
import { eq, asc } from 'drizzle-orm'
import { task } from '../../../database/schema'

describe('Reorder Tasks', () => {
  it('should reorder tasks', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)

    const task1 = await makeTask(column.id, label.id, 'a0')
    const task2 = await makeTask(column.id, label.id, 'a1')
    const task3 = await makeTask(column.id, label.id, 'a2')

    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          activeId: task1.id,
          overId: task3.id,
          columnId: column.id,
        }),
      })
    )

    expect(response.status).toBe(200)

    const tasks = await db
      .select()
      .from(task)
      .where(eq(task.columnId, column.id))
      .orderBy(asc(task.order))

    expect(tasks).toHaveLength(3)

    expect(tasks[0].id).toBe(task2.id)
    expect(tasks[1].id).toBe(task1.id) // Moved before task3
    expect(tasks[2].id).toBe(task3.id)

    // Verify ordering is correct
    expect(tasks[0].order < tasks[1].order).toBe(true)
    expect(tasks[1].order < tasks[2].order).toBe(true)
  })

  it('should move task to another column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column1 = await makeColumn(project.id)
    const column2 = await makeColumn(project.id)
    const label = await makeLabel(project.id)

    const task1 = await makeTask(column1.id, label.id, 'a0')

    const response = await app.handle(
      new Request('http://localhost/tasks/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          activeId: task1.id,
          columnId: column2.id,
        }),
      })
    )

    expect(response.status).toBe(200)

    const taskInDb = await db.select().from(task).where(eq(task.id, task1.id))
    expect(taskInDb[0].columnId).toBe(column2.id)
  })
})
