import { openapi } from '@elysiajs/openapi';
import { Elysia } from 'elysia';
import { z } from 'zod';
import { betterAuthPlugin, OpenAPI } from './http/plugins/better-auth';
import cors from '@elysiajs/cors';
import { env } from './env';


const app = new Elysia()
	.use(cors({
		origin: env.FRONTEND_URL,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true,
		allowedHeaders: ['Content-Type', 'Authorization'],
	 }))
	.use(
		openapi({
        documentation: {
            components: await OpenAPI.components,
            paths: await OpenAPI.getPaths()
        }
    })
	)
	.use(betterAuthPlugin)
	.get(
		'/users/:id',
		({ params, user }) => {
			const { id } = params;
			return {
				id,
				name: user.name,
			};
		},
		{
			auth: true,
			detail: {
				summary: 'Get user by id',
				description: 'Get user by id',
			},
			params: z.object({
				id: z.string(),
			}),
			response: {
				200: z.object({
					id: z.string(),
					name: z.string(),
				}),
			},
		},
	)
	.listen(3333);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
