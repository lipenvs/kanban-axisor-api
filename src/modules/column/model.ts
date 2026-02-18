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
    order: z.number().int().optional(),
  }),
  response: Column,
}

export const ReorderColumn = {
  body: z.object({
    activeId: z.uuid(),
    overId: z.uuid(),
  }),
}

export const DeleteColumn = {
  params: z.object({
    id: z.string(),
  }),
}
