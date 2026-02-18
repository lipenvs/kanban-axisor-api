import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { project } from '../../database/schema/project'

export async function makeProject(userId: string, title?: string) {
  const result = await db.insert(project).values({
    name: title ?? faker.lorem.word(2),
    userId,
  }).returning()

  return result[0]
}