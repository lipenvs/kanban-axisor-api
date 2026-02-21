import { eq, asc, desc, sql } from "drizzle-orm";
import { db } from "../../database/client";
import { column } from "../../database/schema/column";
import { task } from "../../database/schema/task";
import { label } from "../../database/schema/label";
import { user } from "../../database/schema/user";
import { attachment } from "../../database/schema";
import { attachmentDeleteQueue } from "../../queue";

export abstract class ColumnService {
  static async create(title: string, projectId: string) {
  const [lastColumn] = await db
    .select({ order: column.order })
    .from(column)
    .where(eq(column.projectId, projectId))
    .orderBy(desc(column.order))
    .limit(1);

  const order = (lastColumn?.order ?? 0) + 1;

  const [created] = await db.insert(column).values({
    title,
    projectId,
    order,
  }).returning();

  return created;
}

static async getColumnsWithTasks(projectId: string) {
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
          description: task.description,
          dueDate: task.dueDate,
          label: {
            name: label.name,
            color: label.color,
          },
          assignee: {
            name: user.name,
            image: user.image,
          },
          attachmentCount: sql<number>`count(${attachment.id})::int`,
        })
        .from(task)
        .leftJoin(label, eq(task.labelId, label.id))
        .leftJoin(user, eq(task.assigneeId, user.id))
        .leftJoin(attachment, eq(attachment.taskId, task.id))
        .where(eq(task.columnId, col.id))
        .groupBy(
          task.id,
          label.name,
          label.color,
          user.name,
          user.image,
        )
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

static async update(id: string, updates: { title?: string }) {
  const [updated] = await db.update(column).set(updates).where(eq(column.id, id)).returning();
  return updated;
}

static async reorder(items: { id: string; order: number }[]) {
  await db.transaction(async (tx) => {
    await Promise.all(
      items.map((item) =>
        tx
          .update(column)
          .set({ order: item.order, updatedAt: new Date() })
          .where(eq(column.id, item.id))
      )
    );
  });
}

static async delete(id: string) {
  const attachments = await db
    .select({ storageKey: attachment.storageKey })
    .from(attachment)
    .innerJoin(task, eq(attachment.taskId, task.id))
    .where(eq(task.columnId, id));

  await db.delete(column).where(eq(column.id, id));

  if (attachments.length > 0) {
    await attachmentDeleteQueue.add("attachment-delete", {
      storageKeys: attachments.map((a) => a.storageKey),
    });
  }
}

  
}
