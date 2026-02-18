import { eq, asc, desc } from "drizzle-orm";
import { db } from "../../database/client";
import { column } from "../../database/schema/column";

export abstract class ColumnService {
  static async create(title: string, projectId: string) {
    const [lastColumn] = await db
      .select({ order: column.order })
      .from(column)
      .where(eq(column.projectId, projectId))
      .orderBy(desc(column.order))
      .limit(1);

    const order = lastColumn ? lastColumn.order + 1 : 0;

    const [created] = await db.insert(column).values({
      title,
      projectId,
      order,
    }).returning();

    return created;
  }

  static async getAll(projectId: string) {
    return db.select().from(column).where(eq(column.projectId, projectId)).orderBy(asc(column.order));
  }

  static async update(id: string, updates: { title?: string; order?: number }) {
    const [updated] = await db.update(column).set(updates).where(eq(column.id, id)).returning();
    return updated;
  }

  static async delete(id: string) {
    await db.delete(column).where(eq(column.id, id));
  }
}
