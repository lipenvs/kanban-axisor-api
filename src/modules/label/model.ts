import { z } from 'zod'

export const Label = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  projectId: z.string(),
})

export const CreateLabel = {
  body: z.object({
    name: z.string().min(1),
    color: z.string().min(1),
    projectId: z.uuid(),
  }),
  response: Label.pick({
    id: true,
    name: true,
    color: true,
  }),
}

export const GetLabels = {
  params: z.object({
    projectId: z.string(),
  }),
  query: z.object({
    search: z.string().optional(),
  }),
  response: z.object({
    labels: z.array(Label),
  }),
}

export const UpdateLabel = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string(),
    color: z.string(),
  }),
  response: Label,
}
