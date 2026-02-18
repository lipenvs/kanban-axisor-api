import { and, ilike, SQL } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "../../database/client";
import { project } from "../../database/schema";

export abstract class ProjectService {
  static async create(name: string, userId: string) {
    const [created] = await db.insert(project).values({
      name,
      userId,
    }).returning({ id: project.id, name: project.name });

    return created;
  }

  static async getAll(search?: string) {
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(ilike(project.name, `%${search}%`));
    }

    return db.select().from(project).where(and(...conditions));
  }

  static async update(id: string, name: string) {
    await db.update(project).set({ name }).where(eq(project.id, id));
  }

  static async delete(id: string) {
    await db.delete(project).where(eq(project.id, id));
  }
}
