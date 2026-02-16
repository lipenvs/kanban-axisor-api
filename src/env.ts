import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.url(),
	POSTGRES_USER: z.string(),
	POSTGRES_PASSWORD: z.string(),
	POSTGRES_DB: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.url(),
	FRONTEND_URL: z.url(),
	RESEND_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);