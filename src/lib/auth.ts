import { DROPBOX_SCOPES, GOOGLE_SCOPES } from "@/actions/constants/scopes"
import {betterAuth, BetterAuthOptions} from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean) as string[],
  account: {
    skipStateCookieCheck: true,
    accountLinking: {
      allowDifferentEmails: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [...GOOGLE_SCOPES],
      accessType: "offline",
    },
    dropbox: {
      clientId: process.env.DROPBOX_CLIENT_ID as string,
      clientSecret: process.env.DROPBOX_CLIENT_SECRET as string,
      scope: [...DROPBOX_SCOPES],
    }
  },
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          await prisma.oAuthConnection.upsert({
            where: {
              userId_provider: {
                userId: account.userId,
                provider: account.providerId!
              }
            },
            create: {
              userId: account.userId,
              provider: account.providerId!,
              accessToken: account.accessToken ?? "",
              refreshToken: account.refreshToken ?? "",
              tokenExpiresAt: account.accessTokenExpiresAt ?? new Date(),
              isActive: true,
              scope: account.scope ??
                  (account.providerId === "dropbox"
                      ? DROPBOX_SCOPES.join(",")
                      : GOOGLE_SCOPES.join(",")),
            },
            update: {
              accessToken: account.accessToken ?? "",
              refreshToken: account.refreshToken ?? "",
              tokenExpiresAt: account.accessTokenExpiresAt ?? new Date(),
              isActive: true,
            },
          })
        }
      }
    }
  }
})