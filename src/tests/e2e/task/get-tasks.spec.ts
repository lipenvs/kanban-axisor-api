import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { makeLabel } from '../../factories/make-label'
import { makeTask } from '../../factories/make-task'

describe('Get Tasks', () => {
  it('should get all tasks from a project', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)
    const task1 = await makeTask(column.id, label.id)
    const task2 = await makeTask(column.id, label.id)

    const response = await app.handle(
      new Request(`http://localhost/tasks?projectId=${project.id}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.tasks).toHaveLength(2)
    expect(body.tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: task1.id }),
        expect.objectContaining({ id: task2.id }),
      ])
    )
  })

  it('should get all tasks from a column', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column1 = await makeColumn(project.id)
    const column2 = await makeColumn(project.id)
    const label = await makeLabel(project.id)
    
    const task1 = await makeTask(column1.id, label.id)
    await makeTask(column2.id, label.id)

    const response = await app.handle(
      new Request(`http://localhost/tasks?columnId=${column1.id}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.tasks).toHaveLength(1)
    expect(body.tasks[0].id).toBe(task1.id)
  })
})
