import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiUsage, user } from "@/db/schema";

export type AiUsageType = "plan" | "replan" | "grocery";

// Free users get this many AI plans in total. Premium users are unlimited.
export const FREE_LIMITS: Record<AiUsageType, number> = { plan: 1, replan: 0, grocery: 0 };

export async function isPremium(userId: string) {
  const rows = await db.select({ isPremium: user.isPremium }).from(user).where(eq(user.id, userId)).limit(1);
  return rows[0]?.isPremium ?? false;
}

export async function usedCount(userId: string, type: AiUsageType) {
  const rows = await db
    .select({ n: count() })
    .from(aiUsage)
    .where(and(eq(aiUsage.userId, userId), eq(aiUsage.type, type)));
  return rows[0]?.n ?? 0;
}

// Reserve one AI use BEFORE calling the AI, so double-clicks or parallel
// requests can't get around the limit. Returns a release function to give
// the use back if the AI call fails, or null if the user is over the limit.
export async function reserveAiUse(userId: string, type: AiUsageType) {
  const premium = await isPremium(userId);
  const [row] = await db.insert(aiUsage).values({ userId, type }).returning({ id: aiUsage.id });
  if (!premium && (await usedCount(userId, type)) > FREE_LIMITS[type]) {
    await db.delete(aiUsage).where(eq(aiUsage.id, row.id));
    return null;
  }
  return async () => {
    await db.delete(aiUsage).where(eq(aiUsage.id, row.id));
  };
}
