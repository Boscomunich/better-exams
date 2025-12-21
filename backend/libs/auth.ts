import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer, lastLoginMethod } from 'better-auth/plugins';
import type { BetterAuthPlugin } from 'better-auth';
import { passkey } from '@better-auth/passkey';
import { expo } from '@better-auth/expo';
import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),

  plugins: [bearer() as BetterAuthPlugin, lastLoginMethod(), passkey(), expo()],

  hooks: {},
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    sendResetPassword: async () => {
      // implement sending reset password email here
    },
    resetPasswordTokenExpiresIn: 3600,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },
  trustedOrigins: [
    'myapp://', // Development mode - Expo's exp:// scheme with local IP ranges
    ...(process.env.NODE_ENV === 'development'
      ? [
          'http://localhost:8080',
          'exp://*/*', // Trust all Expo development URLs
          'exp://10.0.0.*:*/*', // Trust 10.0.0.x IP range
          'exp://192.168.*.*:*/*', // Trust 192.168.x.x IP range
          'exp://172.*.*.*:*/*', // Trust 172.x.x.x IP range
          'exp://localhost:*/*', // Trust localhost
        ]
      : []),
  ],
});
