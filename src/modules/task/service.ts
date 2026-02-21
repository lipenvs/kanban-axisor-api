import { eq, asc, desc } from "drizzle-orm";
import { db } from "../../database/client";
import { task } from "../../database/schema/task";
import { column } from "../../database/schema/column";

export abstract class TaskService {
  static async create(data: { title: string; columnId: string; labelId?: string | null; assigneeId?: string | null; description?: string | null; dueDate?: Date | null }) {
    const [lastTask] = await db
      .select({ order: task.order })
      .from(task)
      .where(eq(task.columnId, data.columnId))
      .orderBy(desc(task.order))
      .limit(1);

    const order = (lastTask?.order ?? 0) + 1;

    const [created] = await db.insert(task).values({
      ...data,
      order,
    }).returning();

    return created;
  }

  static async getAllByProjectId(projectId: string) {
    return db
      .select({
        id: task.id,
        title: task.title,
        order: task.order,
        columnId: task.columnId,
        labelId: task.labelId,
        assigneeId: task.assigneeId,
        description: task.description,
        dueDate: task.dueDate,
      })
      .from(task)
      .innerJoin(column, eq(task.columnId, column.id))
      .where(eq(column.projectId, projectId))
      .orderBy(asc(column.order), asc(task.order));
  }

  static async update(id: string, updates: Partial<typeof task.$inferInsert>) {
    const [updated] = await db.update(task).set({ ...updates, updatedAt: new Date() }).where(eq(task.id, id)).returning();
    return updated;
  }

  static async reorder(items: { id: string; columnId: string; order: number }[]) {
    await db.transaction(async (tx) => {
      await Promise.all(
        items.map((item) =>
          tx
            .update(task)
            .set({ columnId: item.columnId, order: item.order, updatedAt: new Date() })
            .where(eq(task.id, item.id))
        )
      );
    });
}

  static async delete(id: string) {
    await db.delete(task).where(eq(task.id, id));
  }
}
