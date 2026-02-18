import { Elysia } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { authPlugin, OpenAPI } from './modules/better-auth';
import { projectController } from './modules/project';
import { labelController } from './modules/label';
import { env } from './env';
import { toJSONSchema, type ZodType } from 'zod';

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
  .use(authPlugin)
  .use(projectController)
  .use(labelController);
