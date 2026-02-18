import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { label } from '../../database/schema/label'

export async function makeLabel(projectId: string, title?: string, color?: string) {
  const result = await db.insert(label).values({
    name: title ?? faker.lorem.word(2),
    projectId,
    color: color ?? faker.color.rgb(),
  }).returning()

  return result[0]
}