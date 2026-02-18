import { z } from 'zod'

export const Project = z.object({
  id: z.string(),
  name: z.string(),
})

export const CreateProject = {
  body: z.object({
    name: z.string().min(1),
  }),
  response: Project,
}

export const GetProjects = {
  query: z.object({
    search: z.string().optional(),
  }),
  response: z.object({
    projects: z.array(Project),
  }),
}

export const UpdateProject = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string(),
  }),
  response: Project,
}

export const DeleteProject = {
  params: z.object({
    id: z.string(),
  }),
}
