import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";

// Server-side login setup. The secret (BETTER_AUTH_SECRET) and site address
// (BETTER_AUTH_URL) are read automatically from environment variables.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      // input: false means users can never set these themselves at sign-up.
      isPremium: { type: "boolean", defaultValue: false, input: false },
      stripeCustomerId: { type: "string", required: false, input: false },
    },
  },
  plugins: [nextCookies()],
});
