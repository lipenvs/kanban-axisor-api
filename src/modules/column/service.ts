import { eq, asc, desc, sql, inArray } from "drizzle-orm";
import { db } from "../../database/client";
import { column } from "../../database/schema/column";
import { task } from "../../database/schema/task";
import { label } from "../../database/schema/label";
import { user } from "../../database/schema/user";
import { attachment } from "../../database/schema/attachment";
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

  /** Salva a posição das colunas a partir da lista ordenada de ids (índice = ordem). */
  static async saveOrder(projectId: string, columnIds: string[]) {
    return db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: column.id })
        .from(column)
        .where(eq(column.projectId, projectId));

      const existingIds = new Set(existing.map((c) => c.id));
      const validIds = columnIds.filter((id) => existingIds.has(id));
      if (validIds.length !== columnIds.length) {
        throw new Error("Some column ids do not belong to this project");
      }

      let prevOrder: string | null = null;
      for (const columnId of validIds) {
        const order = generateKeyBetween(prevOrder, null);
        await tx
          .update(column)
          .set({ order, updatedAt: new Date() })
          .where(eq(column.id, columnId));
        prevOrder = order;
      }
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
          .orderBy(asc(task.order));

        const taskIds = tasks.map((t) => t.id);
        const attachmentCounts = taskIds.length > 0
          ? await db
              .select({
                taskId: attachment.taskId,
                count: sql<number>`count(*)::int`.as("count"),
              })
              .from(attachment)
              .where(inArray(attachment.taskId, taskIds))
              .groupBy(attachment.taskId)
          : [];

        const attachmentCountMap = new Map(
          attachmentCounts.map((ac) => [ac.taskId, ac.count])
        );

        const tasksWithAttachmentCount = tasks.map((t) => ({
          ...t,
          attachmentCount: attachmentCountMap.get(t.id) ?? 0,
        }));

        return {
          id: col.id,
          title: col.title,
          cards: tasksWithAttachmentCount,
        };
      })
    );

    return columnsWithTasks;
  }
}
