import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { task } from '../../database/schema'

export async function makeTask(columnId: string, labelId: string, order?: number, title?: string) {
  const result = await db.insert(task).values({
    title: title ?? faker.lorem.word(3),
    columnId,
    labelId,
    order: order ?? 10000,
    description: faker.lorem.sentence(),
    dueDate: faker.date.future(),
  }).returning()

  return result[0]
}
