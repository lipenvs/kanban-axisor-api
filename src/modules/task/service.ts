import { eq, asc, desc, and, lt, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { task } from "../../database/schema/task";
import { column } from "../../database/schema/column";
import { generateKeyBetween } from "fractional-indexing";

export abstract class TaskService {
  static async create(data: { title: string; columnId: string; labelId: string; description?: string | null; dueDate?: Date | null }) {
    const [lastTask] = await db
      .select({ order: task.order })
      .from(task)
      .where(eq(task.columnId, data.columnId))
      .orderBy(desc(task.order))
      .limit(1);

    const order = generateKeyBetween(lastTask?.order ?? null, null);

    const [created] = await db.insert(task).values({
      ...data,
      order,
    }).returning();

    return created;
  }

  static async getAll(columnId?: string, projectId?: string) {
    if (columnId) {
      return db.select().from(task).where(eq(task.columnId, columnId)).orderBy(asc(task.order));
    }

    if (projectId) {
      // Fetch all tasks for all columns in the project
      return db
        .select({
          id: task.id,
          title: task.title,
          order: task.order,
          columnId: task.columnId,
          labelId: task.labelId,
          description: task.description,
          dueDate: task.dueDate,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        })
        .from(task)
        .innerJoin(column, eq(task.columnId, column.id))
        .where(eq(column.projectId, projectId))
        .orderBy(asc(column.order), asc(task.order)); // Sort by column order then task order
    }

    return [];
  }

  static async update(id: string, updates: Partial<typeof task.$inferInsert>) {
    const [updated] = await db.update(task).set({ ...updates, updatedAt: new Date() }).where(eq(task.id, id)).returning();
    return updated;
  }

  static async reorder(activeId: string, overId?: string, newColumnId?: string) {
    return db.transaction(async (tx) => {
      const [active] = await tx.select().from(task).where(eq(task.id, activeId));
      if (!active) throw new Error("Task not found");

      const targetColumnId = newColumnId || active.columnId;

      if (!overId && active.columnId === targetColumnId) return;

      let newOrder: string;

      if (!overId) {
        // Moving to end of target column (or empty column)
        const [lastTask] = await tx
          .select({ order: task.order })
          .from(task)
          .where(eq(task.columnId, targetColumnId))
          .orderBy(desc(task.order))
          .limit(1);

        newOrder = generateKeyBetween(lastTask?.order ?? null, null);
      } else {
        // Positioning before overId
        const [over] = await tx.select().from(task).where(eq(task.id, overId));
        if (!over) throw new Error("Over task not found");

        const [prev] = await tx
          .select({ order: task.order })
          .from(task)
          .where(and(
            eq(task.columnId, targetColumnId),
            lt(task.order, over.order),
            sql`${task.id} != ${activeId}`,
          ))
          .orderBy(desc(task.order))
          .limit(1);

        newOrder = generateKeyBetween(prev?.order ?? null, over.order);
      }

      await tx.update(task).set({
        order: newOrder,
        columnId: targetColumnId,
        updatedAt: new Date(),
      }).where(eq(task.id, activeId));
    });
  }

  static async delete(id: string) {
    await db.delete(task).where(eq(task.id, id));
  }
}
