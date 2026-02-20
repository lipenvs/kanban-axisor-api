import { z } from 'zod'
import { task } from '../../database/schema/task';
import { createSelectSchema } from 'drizzle-zod';

export const TaskSchema = createSelectSchema(task)

export const CreateTask = {
  body: z.object({
    title: z.string().min(1),
    columnId: z.uuid(),
    labelId: z.uuid().nullable().optional(),
    assigneeId: z.uuid().nullable().optional(),
    description: z.string().optional(),
    dueDate: z.coerce.date().nullable().optional(),
  }),
  response: TaskSchema
}

export const GetTasks = {
  query: z.object({
    projectId: z.uuid(),
  }),
  response: z.object({
    tasks: z.array(TaskSchema.omit({ createdAt: true, updatedAt: true })),
  }),
}

export const UpdateTask = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
    columnId: z.uuid().optional(),
    labelId: z.uuid().nullable().optional(),
    assigneeId: z.uuid().nullable().optional(),
    description: z.string().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    order: z.number().optional(),
  }),
  response: TaskSchema,
}

export const ReorderTasks = {
  body: z.object({
    tasks: z.array(z.object({
      id: z.uuid(),
      columnId: z.uuid(),
      order: z.number(),
    })),
  }),
}

export const DeleteTask = {
  params: z.object({
    id: z.string(),
  }),
}
