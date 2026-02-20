import { describe, expect, it } from "vitest";
import { makeUser } from "../../factories/make-user";
import { app } from "../../../app";
import { makeProject } from "../../factories/make-project";
import { randomUUIDv7 } from "bun";
import { makeLabel } from "../../factories/make-label";
import { faker } from "@faker-js/faker";

describe('Get Labels', () => {
  it('should get labels', async () => {
    const { cookie, userId } = await makeUser()

    const projectName = randomUUIDv7();
    const projectCreated = await makeProject(userId, projectName);

    const labelName = randomUUIDv7();
    const labelColor = faker.color.rgb();
    await makeLabel(projectCreated.id, labelName, labelColor);

    const response = await app.handle(
      new Request(`http://localhost/labels/${projectCreated.id}?search=${labelName}`, {
        method: 'GET',
        headers: { Cookie: cookie },
      })
    )

    const body = await response.json();

    expect(response.status).toBe(200)
    expect(body).toEqual({
      labels: [
        {
          id: expect.any(String),
          name: labelName,
          color: labelColor,
          projectId: projectCreated.id,
        }
      ]
    })
  })
})
