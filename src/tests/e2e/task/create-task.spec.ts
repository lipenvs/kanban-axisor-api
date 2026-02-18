import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'
import { makeLabel } from '../../factories/make-label'

describe('Create Task', () => {
  it('should create a task', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)
    const title = faker.lorem.word()

    const response = await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ 
          title, 
          columnId: column.id,
          labelId: label.id,
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual(expect.objectContaining({
      id: expect.any(String),
      title,
      columnId: column.id,
      labelId: label.id,
      order: 10000,
    }))
  })

  it('should auto increment task order', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)
    const label = await makeLabel(project.id)

    await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ 
          title: 'First', 
          columnId: column.id,
          labelId: label.id,
        }),
      })
    )

    const response = await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ 
          title: 'Second', 
          columnId: column.id,
          labelId: label.id,
        }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body.order).toBe(20000)
  })
})
