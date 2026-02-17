import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { betterAuthPlugin, OpenAPI } from './http/plugins/better-auth';
import { createProject } from './http/routes/create-project';
import { getProjects } from './http/routes/get-projects';
import { deleteProject } from './http/routes/delete-project';
import { updateProject } from './http/routes/update-project';
import { env } from './env';
import { toJSONSchema, type ZodType } from 'zod';
import { createLabel } from './http/routes/create-label';

export const app = new Elysia()
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    openapi({
      documentation: {
        components: await OpenAPI.components,
        paths: await OpenAPI.getPaths(),
      },
      mapJsonSchema: {
        zod: (schema: ZodType) => {
          const { $schema, ...rest } = toJSONSchema(schema) as Record<string, unknown>;
          return rest;
        },
      },
    })
  )
  .use(betterAuthPlugin)
  .use(createProject)
  .use(getProjects)
  .use(deleteProject)
  .use(updateProject)
  .use(createLabel);