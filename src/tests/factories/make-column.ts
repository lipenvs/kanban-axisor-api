import { faker } from '@faker-js/faker'
import { db } from '../../database/client'
import { column } from '../../database/schema'
import { desc, eq } from 'drizzle-orm'

export async function makeColumn(projectId: string, order?: number, title?: string) {
  const [lastColumn] = await db.select().from(column).where(eq(column.projectId, projectId)).orderBy(desc(column.order)).limit(1);

  const result = await db.insert(column).values({
    title: title ?? faker.lorem.word(2),
    projectId,
    order: order ?? (lastColumn?.order ?? 0) + 1,
  }).returning()

  return result[0]
}
