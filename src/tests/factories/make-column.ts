import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { column } from '../../database/schema/column'

export async function makeColumn(projectId: string, order?: number, title?: string) {
  const result = await db.insert(column).values({
    title: title ?? faker.lorem.word(2),
    projectId,
    order: order ?? faker.number.int({ min: 0, max: 100 }),
  }).returning()

  return result[0]
}
