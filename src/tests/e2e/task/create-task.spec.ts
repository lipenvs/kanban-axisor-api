import { describe, it, expect, afterEach } from 'vitest'
import { app } from '../../../app'
import { faker } from '@faker-js/faker'
import { db } from '../../../database/client'
import { makeUser } from '../../factories/make-user'
import { task, column, user } from '../../../database/schema'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'

describe('Create Task', () => {
  afterEach(async () => {
    await db.delete(task)
    await db.delete(column)
    await db.delete(user)
  })

  it('should create a task', async () => {
    const { cookie, userId } = await makeUser()
    const title = faker.lorem.word()
    const project = await makeProject(userId)
    const column = await makeColumn(project.id)

    const response = await app.handle(
      new Request('http://localhost/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: JSON.stringify({ title, columnId: column.id }),
      })
    )

    const body = await response.json()

    expect(response.status).toBe(201)
    expect(body).toEqual({
      id: expect.any(String),
      title,
      columnId: column.id,
      assigneeId: null,
      labelId: null,
      description: null,
      dueDate: null,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      order: 1000
    })
  })
})
