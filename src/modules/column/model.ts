import { z } from 'zod'

export const Column = z.object({
  id: z.string(),
  title: z.string(),
  order: z.string(),
  projectId: z.string(),
})

export const CreateColumn = {
  body: z.object({
    title: z.string().min(1),
    projectId: z.uuid(),
  }),
  response: Column
}

export const GetColumns = {
  query: z.object({
    projectId: z.uuid(),
  }),
  response: z.object({
    columns: z.array(Column),
  }),
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

export const ReorderColumn = {
  body: z.object({
    activeId: z.uuid(),
    overId: z.uuid().optional(),
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
  order: z.string(),
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

export const GetKanbanBoard = {
  query: z.object({
    projectId: z.uuid(),
  }),
  response: z.array(KanbanColumn),
}
