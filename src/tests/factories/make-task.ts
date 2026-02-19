import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { task } from '../../database/schema'

export async function makeTask(columnId: string, labelId: string, order?: string, title?: string) {
  const result = await db.insert(task).values({
    title: title ?? faker.lorem.word(3),
    columnId,
    labelId,
    order: order ?? 'a0',
    description: faker.lorem.sentence(),
    dueDate: faker.date.future(),
  }).returning()

  return result[0]
}
