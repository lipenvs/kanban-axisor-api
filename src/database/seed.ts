import { db } from "./client";
import { project } from "./schema";

async function seed() {
    await db.insert(project).values({ name: "Project Default" });
}

seed();