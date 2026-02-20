import { describe, expect, it } from "vitest";
import { makeUser } from "../../factories/make-user";
import { app } from "../../../app";
import { makeProject } from "../../factories/make-project";

describe('Get Projects', () => {
  it('should get projects', async () => {
    const { cookie, userId } = await makeUser()

    const projectName = crypto.randomUUID();
    await makeProject(userId, projectName);

    const response = await app.handle(
      new Request(`http://localhost/projects?search=${projectName}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json();

    expect(response.status).toBe(200)
    expect(body).toEqual({
      projects: [
        {
          id: expect.any(String),
          name: projectName,
        }
      ]
    })
  })
})
