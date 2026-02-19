import { z } from 'zod'

export const Task = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  columnId: z.string(),
  labelId: z.string().nullable(),
  description: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
})

export const CreateTask = {
  body: z.object({
    title: z.string().min(1),
    columnId: z.uuid(),
    labelId: z.uuid().nullable().optional(),
    description: z.string().optional(),
    dueDate: z.coerce.date().nullable().optional(),
  }),
  response: Task
}

export const GetTasks = {
  query: z.object({
    columnId: z.uuid().optional(),
    projectId: z.uuid().optional(),
  }),
  response: z.object({
    tasks: z.array(Task),
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
    description: z.string().optional(),
    dueDate: z.coerce.date().nullable().optional(),
    order: z.number().int().optional(),
  }),
  response: Task,
}

export const ReorderTask = {
  body: z.object({
    activeId: z.uuid(),
    overId: z.uuid().optional(),
    columnId: z.uuid().optional(), // If moving between columns
  }),
}

export const DeleteTask = {
  params: z.object({
    id: z.string(),
  }),
}
