import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// DATABASE_URL comes from .env.local (on your computer) or Vercel's
// Environment Variables (on the live site). Never paste it into code.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local and to Vercel.");
}

export const db = drizzle(neon(databaseUrl), { schema });
