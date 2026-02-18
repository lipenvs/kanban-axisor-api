import { eq, asc, desc, and, gt, lt, gte, lte, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { task } from "../../database/schema/task";
import { column } from "../../database/schema/column";

export abstract class TaskService {
  static async create(data: { title: string; columnId: string; labelId: string; description?: string | null; dueDate?: Date | null }) {
    const [lastTask] = await db
      .select({ order: task.order })
      .from(task)
      .where(eq(task.columnId, data.columnId))
      .orderBy(desc(task.order))
      .limit(1);

    const order = lastTask ? lastTask.order + 10000 : 10000;

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
      const isDifferentColumn = active.columnId !== targetColumnId;

      if (!overId && !isDifferentColumn) return;

      let newOrder: number;

      if (!overId && isDifferentColumn) {
        const [lastTask] = await tx
          .select({ order: task.order })
          .from(task)
          .where(eq(task.columnId, targetColumnId))
          .orderBy(desc(task.order))
          .limit(1);

        newOrder = lastTask ? lastTask.order + 10000 : 10000;
      } else {
        const [over] = await tx.select().from(task).where(eq(task.id, overId!));
        if (!over) throw new Error("Over task not found");

        const [prev] = await tx
          .select({ order: task.order })
          .from(task)
          .where(and(eq(task.columnId, targetColumnId), lt(task.order, over.order)))
          .orderBy(desc(task.order))
          .limit(1);

        const prevOrder = prev ? prev.order : 0;
        const nextOrder = over.order;

        newOrder = Math.floor((prevOrder + nextOrder) / 2);

        if (newOrder === prevOrder || newOrder === nextOrder || nextOrder - prevOrder < 2) {
          const allTasks = await tx
            .select({ id: task.id })
            .from(task)
            .where(eq(task.columnId, targetColumnId))
            .orderBy(asc(task.order));

          let orderedIds: string[] = [];
          for (const t of allTasks) {
            if (t.id === activeId) continue;
            if (t.id === overId) orderedIds.push(activeId);
            orderedIds.push(t.id);
          }

          if (!orderedIds.includes(activeId)) orderedIds.push(activeId);

          let counter = 10000;
          for (const id of orderedIds) {
            await tx.update(task).set({ order: counter, columnId: targetColumnId }).where(eq(task.id, id));
            counter += 10000;
          }
          return;
        }
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
