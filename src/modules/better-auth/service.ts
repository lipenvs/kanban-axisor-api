import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { db } from '../../database/client';
import { env } from '../../env';

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.FRONTEND_URL],
  basePath: '/auth',
  plugins: [openAPI()],
	database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    password: {
      hash: (password) => Bun.password.hash(password),
      verify: ({ password, hash }) => Bun.password.verify(password, hash),
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url}) => {
      // void resend.emails.send({
      //   from: 'Kanban Axisor <axisor@universorust.com.br>',
      //   to: user.email,
      //   subject: 'Confirme sua conta no Kanban Axisor',
      //   react: ConfirmAccountEmail({
      //     username: user.name,
      //     confirmationLink: url,
      //   }),
      // });
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    }
  }
});
