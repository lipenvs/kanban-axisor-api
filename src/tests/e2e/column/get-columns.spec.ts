import { describe, it, expect } from 'vitest'
import { app } from '../../../app'
import { makeUser } from '../../factories/make-user'
import { makeProject } from '../../factories/make-project'
import { makeColumn } from '../../factories/make-column'

describe('Get Columns', () => {
  it('should get all columns from a project', async () => {
    const { cookie, userId } = await makeUser()
    const project = await makeProject(userId)

    const column1 = await makeColumn(project.id)
    const column2 = await makeColumn(project.id)

    const response = await app.handle(
      new Request(`http://localhost/columns?projectId=${project.id}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.columns).toHaveLength(2)
    expect(body.columns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: column1.id }),
        expect.objectContaining({ id: column2.id }),
      ])
    )
  })
})
