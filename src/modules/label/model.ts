import z from "zod";

export const LabelModel = {
  createBody: z.object({
    name: z.string().min(1),
    color: z.string().min(1),
    projectId: z.uuid(),
  }),

  createResponse: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
  }),

  getParam: z.object({
    projectId: z.string(),
  }),

  getQuery: z.object({
    search: z.string().optional(),
  }),

  getResponse: z.object({
    labels: z.array(z.object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      projectId: z.string(),
    })),
  }),

  params: z.object({
    id: z.string(),
  }),

  updateBody: z.object({
    name: z.string(),
    color: z.string(),
  }),
};
