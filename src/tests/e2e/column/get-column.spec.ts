import { describe, expect, it } from "vitest";
import { makeUser } from "../../factories/make-user";
import { app } from "../../../app";
import { makeProject } from "../../factories/make-project";
import { randomUUIDv7 } from "bun";
import { makeColumn } from "../../factories/make-column";
import { makeTask } from "../../factories/make-task";

describe('Get Columns', () => {
  it('should get columns', async () => {
    const { cookie, userId } = await makeUser()

    const projectName = randomUUIDv7();
    const project = await makeProject(userId, projectName);

    const columnName = randomUUIDv7();
    const column = await makeColumn(project.id, 1, columnName);

    await makeTask(column.id);

    const response = await app.handle(
      new Request(`http://localhost/columns?projectId=${project.id}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json();

    expect(response.status).toBe(200)
    expect(body).toEqual([
      {
        id: expect.any(String),
        title: columnName,
        cards: [
          {
            id: expect.any(String),
            title: expect.any(String),
            order: expect.any(Number),
            columnId: expect.any(String),
            labelId: null,
            assigneeId: null,
            description: expect.any(String),
            dueDate: expect.any(String),
            label: null,
            assignee: null,
            attachmentCount: 0,
          }
        ]
      }
    ])
  })
})
