import { z } from "zod";
import { DAYS } from "@/lib/profile-options";

const DAY_VALUES = DAYS.map((d) => d.value) as ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;

// The exact JSON shape we ask Claude to return.
export const aiPlanSchema = z.object({
  summary: z.string().describe("Two friendly sentences about how this week is set up."),
  days: z
    .array(
      z.object({
        day: z.enum(DAY_VALUES),
        focus: z.string().describe('Short label, e.g. "Full-body strength" or "Rest day"'),
        workout: z
          .object({
            title: z.string(),
            minutes: z.number().int(),
            bodyweight: z.array(z.string()).describe("Simple numbered steps for a no-equipment version"),
            gym: z.array(z.string()).describe("Simple numbered steps for a gym version"),
          })
          .nullable()
          .describe("null on rest days"),
        meals: z.array(
          z.object({
            slot: z.enum(MEAL_SLOTS),
            name: z.string(),
            how: z.string().describe("One or two sentences: where to get it or how to make it"),
            estimatedCost: z.number().describe("Estimated US dollars spent outside a meal plan; 0 if covered"),
          }),
        ),
        tip: z.string().describe("One short, practical tip for the day"),
      }),
    )
    .describe("Exactly 7 entries, Monday to Sunday"),
});
export type AiPlan = z.infer<typeof aiPlanSchema>;

// What we store in weekly_plans.plan_json: the AI plan plus stable ids for check-offs.
export type StoredPlan = {
  version: 1;
  summary: string;
  disclaimer: string;
  days: {
    day: AiPlan["days"][number]["day"];
    focus: string;
    tip: string;
    workout: (NonNullable<AiPlan["days"][number]["workout"]> & { id: string }) | null;
    meals: (AiPlan["days"][number]["meals"][number] & { id: string })[];
  }[];
};

export const DISCLAIMER = "Not medical advice. Check with a doctor before starting a new exercise program.";

// Extra checks the JSON format alone can't guarantee. Returns a problem
// description, or null when the plan is good to save.
export function findPlanProblem(
  plan: AiPlan,
  availability: { day: string; minutes: number }[],
): string | null {
  if (plan.days.length !== 7) return `expected 7 days, got ${plan.days.length}`;
  const seen = new Set(plan.days.map((d) => d.day));
  if (seen.size !== 7) return "a day is missing or repeated";
  const free = new Map(availability.map((a) => [a.day, a.minutes]));
  for (const d of plan.days) {
    if (d.workout) {
      const limit = free.get(d.day);
      if (limit === undefined) return `workout scheduled on ${d.day}, which isn't a free day`;
      if (d.workout.minutes < 10 || d.workout.minutes > limit) return `${d.day} workout is ${d.workout.minutes} min (limit ${limit})`;
      if (d.workout.bodyweight.length === 0 || d.workout.gym.length === 0) return `${d.day} workout is missing steps`;
    }
    if (d.meals.length < 2 || d.meals.length > 5) return `${d.day} has ${d.meals.length} meals`;
    if (d.meals.some((m) => m.estimatedCost < 0 || m.estimatedCost > 100)) return `${d.day} has an unrealistic meal cost`;
  }
  return null;
}

export function toStoredPlan(plan: AiPlan): StoredPlan {
  const order = DAY_VALUES;
  const days = [...plan.days].sort((a, b) => order.indexOf(a.day) - order.indexOf(b.day));
  return {
    version: 1,
    summary: plan.summary,
    disclaimer: DISCLAIMER,
    days: days.map((d) => ({
      day: d.day,
      focus: d.focus,
      tip: d.tip,
      workout: d.workout ? { ...d.workout, id: "workout" } : null,
      meals: d.meals.map((m, i) => ({ ...m, id: `meal-${i}` })),
    })),
  };
}
