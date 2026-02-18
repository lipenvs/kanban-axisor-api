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

describe('Delete Task', () => {
  it('should delete a task', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)
    const taskCreated = await makeTask(column.id, label.id)

    const response = await app.handle(
      new Request(`http://localhost/tasks/${taskCreated.id}`, {
        method: 'DELETE',
        headers: { Cookie: cookie },
      })
    )

    expect(response.status).toBe(200)

    const taskInDb = await db.select().from(task).where(eq(task.id, taskCreated.id))
    expect(taskInDb[0]).toBeUndefined()
  })
})
