import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

// Workshop default — set BETTER_AUTH_SECRET in `.env.local` for anything beyond local dev.
const DEV_SECRET = "canteen-workshop-dev-secret-do-not-use-in-prod";
const DEV_ORIGIN_PORTS = Array.from({ length: 11 }, (_, i) => 3000 + i);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),
  secret: process.env.BETTER_AUTH_SECRET ?? DEV_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: DEV_ORIGIN_PORTS.flatMap((port) => [
    `http://localhost:${port}`,
    `http://127.0.0.1:${port}`,
  ]),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
});

export type Auth = typeof auth;
