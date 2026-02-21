import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { makeLabel } from '../../factories/make-label'
import { makeTask } from '../../factories/make-task'
import { db } from '../../../database/client'
import { eq } from 'drizzle-orm'
import { task } from '../../../database/schema'
import { randomUUIDv7 } from 'bun'

describe('Update Task', () => {
  it('should update a task', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)
    const taskName = randomUUIDv7();
    const taskCreated = await makeTask(column.id, taskName, label.id)

    const response = await app.handle(
      new Request(`http://localhost/tasks/${taskCreated.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({
          title: 'Updated Title',
          description: 'New Description',
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body).toEqual(expect.objectContaining({
      id: taskCreated.id,
      title: 'Updated Title',
      description: 'New Description',
    }))

    const taskInDb = await db.select().from(task).where(eq(task.id, taskCreated.id))
    expect(taskInDb[0].title).toBe('Updated Title')
    expect(taskInDb[0].description).toBe('New Description')
  })
})
