import z from "zod";

export const ProjectModel = {
  createBody: z.object({
    name: z.string().min(1),
  }),

  createResponse: z.object({
    id: z.string(),
    name: z.string(),
  }),

  getQuery: z.object({
    search: z.string().optional(),
  }),

  getResponse: z.object({
    projects: z.array(z.object({
      id: z.string(),
      name: z.string(),
    })),
  }),

  params: z.object({
    id: z.string(),
  }),

  updateBody: z.object({
    name: z.string(),
  }),
};
