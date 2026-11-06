import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { checkoffs, weeklyPlans } from "@/db/schema";
import type { StoredPlan } from "@/lib/plan-schema";

// The Monday of the current week, as YYYY-MM-DD (UTC).
export function currentWeekStart(now = new Date()) {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysSinceMonday);
  return d.toISOString().slice(0, 10);
}

export async function getLatestPlan(userId: string) {
  const rows = await db
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.userId, userId))
    .orderBy(desc(weeklyPlans.createdAt))
    .limit(1);
  const row = rows[0];
  return row ? { ...row, plan: row.planJson as StoredPlan } : null;
}

export async function getDoneKeys(userId: string, planId: string) {
  const rows = await db
    .select()
    .from(checkoffs)
    .where(and(eq(checkoffs.userId, userId), eq(checkoffs.planId, planId), eq(checkoffs.done, true)));
  return rows.map((r) => `${r.day}:${r.itemType}:${r.itemId}`);
}
