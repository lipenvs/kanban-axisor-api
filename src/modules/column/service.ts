import { eq, asc, desc, and, lt, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { column } from "../../database/schema/column";
import { task } from "../../database/schema/task";
import { label } from "../../database/schema/label";
import { user } from "../../database/schema/user";
import { generateKeyBetween } from "fractional-indexing";

export abstract class ColumnService {
  static async create(title: string, projectId: string) {
    const [lastColumn] = await db
      .select({ order: column.order })
      .from(column)
      .where(eq(column.projectId, projectId))
      .orderBy(desc(column.order))
      .limit(1);

    const order = generateKeyBetween(lastColumn?.order ?? null, null);

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

  static async update(id: string, updates: { title?: string }) {
    const [updated] = await db.update(column).set(updates).where(eq(column.id, id)).returning();
    return updated;
  }

  static async reorder(activeId: string, overId?: string) {
    return db.transaction(async (tx) => {
      const [active] = await tx.select().from(column).where(eq(column.id, activeId));
      if (!active) throw new Error("Column not found");

      let newOrder: string;

      if (!overId) {
        const [lastColumn] = await tx
          .select({ order: column.order })
          .from(column)
          .where(eq(column.projectId, active.projectId))
          .orderBy(desc(column.order))
          .limit(1);

        newOrder = generateKeyBetween(lastColumn?.order ?? null, null);
      } else {
        const [over] = await tx.select().from(column).where(eq(column.id, overId));
        if (!over) throw new Error("Over column not found");

        const [prev] = await tx
          .select({ order: column.order })
          .from(column)
          .where(and(
            eq(column.projectId, active.projectId),
            lt(column.order, over.order),
            sql`${column.id} != ${activeId}`,
          ))
          .orderBy(desc(column.order))
          .limit(1);

        newOrder = generateKeyBetween(prev?.order ?? null, over.order);
      }

      await tx.update(column).set({
        order: newOrder,
        updatedAt: new Date(),
      }).where(eq(column.id, activeId));
    });
  }

  static async delete(id: string) {
    await db.delete(column).where(eq(column.id, id));
  }

  static async getKanbanBoard(projectId: string) {
    const columns = await db
      .select()
      .from(column)
      .where(eq(column.projectId, projectId))
      .orderBy(asc(column.order));

    const columnsWithTasks = await Promise.all(
      columns.map(async (col) => {
        const tasks = await db
          .select({
            id: task.id,
            title: task.title,
            order: task.order,
            columnId: task.columnId,
            labelId: task.labelId,
            assigneeId: task.assigneeId,
            dueDate: task.dueDate,
            label: {
              name: label.name,
              color: label.color,
            },
            assignee: {
              name: user.name,
              image: user.image,
            },
          })
          .from(task)
          .leftJoin(label, eq(task.labelId, label.id))
          .leftJoin(user, eq(task.assigneeId, user.id))
          .where(eq(task.columnId, col.id))
          // We order by task.order lexicographically as it is a string based on the schema
          .orderBy(asc(task.order));

        return {
          id: col.id,
          title: col.title,
          cards: tasks,
        };
      })
    );

    return columnsWithTasks;
  }
}
