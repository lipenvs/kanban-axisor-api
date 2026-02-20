import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { task } from '../../database/schema'
import { desc, eq } from 'drizzle-orm'

export async function makeTask(columnId: string, labelId: string, order?: number, title?: string) {
  const [lastTask] = await db.select().from(task).where(eq(task.columnId, columnId)).orderBy(desc(task.order)).limit(1);

  const result = await db.insert(task).values({
    title: title ?? faker.lorem.word(3),
    columnId,
    labelId,
    order: order ?? (lastTask?.order ?? 0) + 1,
    description: faker.lorem.sentence(),
    dueDate: faker.date.future(),
  }).returning()

  return result[0]
}
