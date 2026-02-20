import { z } from 'zod'

export const Column = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  projectId: z.string(),
})

export const CreateColumn = {
  body: z.object({
    title: z.string().min(1),
    projectId: z.uuid(),
  }),
  response: Column
}

export const UpdateColumn = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string().optional(),
  }),
  response: Column,
}

export const ReorderColumns = {
  body: z.object({
    columns: z.array(z.object({
      id: z.uuid(),
      order: z.number(),
    })),
  }),
}

export const DeleteColumn = {
  params: z.object({
    id: z.string(),
  }),
}

export const KanbanCard = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number(),
  columnId: z.string(),
  labelId: z.string().nullable(),
  assigneeId: z.string().nullable(),
  description: z.string().nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
  label: z.object({
    name: z.string(),
    color: z.string(),
  }).nullable().optional(),
  assignee: z.object({
    name: z.string(),
    image: z.string().nullable(),
  }).nullable().optional(),
})

export const KanbanColumn = z.object({
  id: z.string(),
  title: z.string(),
  cards: z.array(KanbanCard),
})

export const GetColumnsWithTasks = {
  query: z.object({
    projectId: z.uuid(),
  }),
  response: z.array(KanbanColumn),
}

