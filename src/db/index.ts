import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

// DATABASE_URL comes from .env.local (on your computer) or Vercel's
// Environment Variables (on the live site). Never paste it into code.
// The pool doesn't connect until the first query, so the site can still be
// built when the variable isn't set; queries will fail with a clear message.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl && process.env.NEXT_PHASE !== "phase-production-build") {
  console.error("DATABASE_URL is missing. Add it to .env.local and to Vercel.");
}

// Reuse one connection pool while the dev server hot-reloads.
const globalForDb = globalThis as unknown as { pool?: Pool };
const pool = globalForDb.pool ?? new Pool({ connectionString: databaseUrl, max: 5 });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
