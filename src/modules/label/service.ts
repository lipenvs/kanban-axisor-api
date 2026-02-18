import { and, eq, ilike, SQL } from "drizzle-orm";
import { db } from "../../database/client";
import { label } from "../../database/schema";

export abstract class LabelService {
  static async create(name: string, color: string, projectId: string) {
    const [created] = await db.insert(label).values({
      name,
      color,
      projectId,
    }).returning({ id: label.id, name: label.name, color: label.color });

    return created;
  }

  static async getByProject(projectId: string, search?: string) {
    const conditions: SQL[] = [
      eq(label.projectId, projectId),
    ];

    if (search) {
      conditions.push(ilike(label.name, `%${search}%`));
    }

    return db.select().from(label).where(and(...conditions));
  }

  static async update(id: string, data: { name: string; color: string }) {
    await db.update(label).set(data).where(eq(label.id, id));
  }

  static async delete(id: string) {
    await db.delete(label).where(eq(label.id, id));
  }
}
