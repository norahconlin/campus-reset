"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { checkoffs, weeklyPlans } from "@/db/schema";
import { generateWeeklyPlan, PlanError } from "@/lib/ai";
import type { StoredPlan } from "@/lib/plan-schema";
import { currentWeekStart } from "@/lib/plans";
import { getProfile } from "@/lib/profile";
import { requireSession } from "@/lib/session";
import { reserveAiUse } from "@/lib/usage";

export async function generatePlan(): Promise<{ error?: string; limitReached?: boolean }> {
  const { user } = await requireSession();
  const profile = await getProfile(user.id);
  if (!profile) return { error: "Finish setting up your week first." };

  // Check ai_usage BEFORE calling the AI so free users can't run up costs.
  const release = await reserveAiUse(user.id, "plan");
  if (!release) {
    return { limitReached: true, error: "You've used your free AI plan. Upgrade to Premium for a new plan every week." };
  }

  try {
    const plan = await generateWeeklyPlan(profile);
    await db.insert(weeklyPlans).values({ userId: user.id, weekStart: currentWeekStart(), planJson: plan });
  } catch (error) {
    await release(); // the AI call failed, so it doesn't count against the limit
    if (error instanceof PlanError) return { error: error.message };
    console.error("Plan generation failed", error);
    return { error: "Something went wrong building your plan. Try again." };
  }

  revalidatePath("/plan");
  return {};
}

const checkoffInput = z.object({
  planId: z.string().uuid(),
  day: z.string().max(3),
  itemType: z.enum(["workout", "meal"]),
  itemId: z.string().max(20),
  done: z.boolean(),
});

export async function setCheckoff(input: unknown): Promise<{ error?: string }> {
  const { user } = await requireSession();
  const parsed = checkoffInput.safeParse(input);
  if (!parsed.success) return { error: "That item couldn't be saved." };
  const { planId, day, itemType, itemId, done } = parsed.data;

  // Make sure the plan belongs to this user and the item really exists in it.
  const rows = await db
    .select({ planJson: weeklyPlans.planJson })
    .from(weeklyPlans)
    .where(and(eq(weeklyPlans.id, planId), eq(weeklyPlans.userId, user.id)))
    .limit(1);
  const plan = rows[0]?.planJson as StoredPlan | undefined;
  const dayPlan = plan?.days.find((d) => d.day === day);
  const exists =
    itemType === "workout" ? dayPlan?.workout?.id === itemId : !!dayPlan?.meals.some((m) => m.id === itemId);
  if (!exists) return { error: "That item couldn't be saved." };

  await db
    .insert(checkoffs)
    .values({ userId: user.id, planId, day, itemType, itemId, done })
    .onConflictDoUpdate({
      target: [checkoffs.planId, checkoffs.day, checkoffs.itemType, checkoffs.itemId],
      set: { done, updatedAt: new Date() },
    });
  return {};
}
