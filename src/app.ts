import { Elysia, t } from 'elysia';
import { openapi } from '@elysiajs/openapi';
import cors from '@elysiajs/cors';
import { authPlugin, OpenAPI } from './modules/better-auth';
import { projectController } from './modules/project';
import { labelController } from './modules/label';
import { columnController } from './modules/column';
import { taskController } from './modules/task';
import { attachmentController } from './modules/attachment';
import { env } from './env';
import { toJSONSchema, type ZodType } from 'zod';
import { opentelemetry } from '@elysiajs/opentelemetry';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

export const app = new Elysia()
  .get('/health', () => ({ status: 'ok' }), {
    response: t.Object({ status: t.String() }),
    detail: { operationId: 'getHealth', hide: true },
  })
  .use(
    cors({
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    opentelemetry({
      serviceName: 'axisor-kanban-api',
      spanProcessors: [
        new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
            headers: {
              Authorization: process.env.OTEL_EXPORTER_OTLP_HEADERS?.replace('Authorization=', '') ?? '',
            },
          })
        ),
      ],
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
          const { $schema, ...rest } = toJSONSchema(schema, {
            target: 'openapi-3.0',
            unrepresentable: 'any',
            override: ({ zodSchema, jsonSchema }) => {
              if ((zodSchema as any)._zod?.def?.type === 'date') {
                jsonSchema.type = 'string';
                jsonSchema.format = 'date-time';
              }
            },
          }) as Record<string, unknown>;
          return rest;
        },
      },
    })
  )
  .use(authPlugin)
  .use(projectController)
  .use(labelController)
  .use(columnController)
  .use(taskController)
  .use(attachmentController);
