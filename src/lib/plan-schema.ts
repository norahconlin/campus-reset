import { z } from "zod";
import { DAYS } from "@/lib/profile-options";

const DAY_VALUES = DAYS.map((d) => d.value) as ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const MEAL_SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;

// Accept small variations like "Monday" or "Breakfast" and turn them into
// the short values the app uses ("mon", "breakfast").
const dayValue = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase().slice(0, 3) : v),
  z.enum(DAY_VALUES),
);
const slotValue = z.preprocess(
  (v) => (typeof v === "string" ? v.trim().toLowerCase() : v),
  z.enum(MEAL_SLOTS),
);

// Used to double-check the AI's answer before saving.
export const aiPlanSchema = z.object({
  summary: z.string(),
  days: z.array(
    z.object({
      day: dayValue,
      focus: z.string(),
      workout: z
        .object({
          title: z.string(),
          minutes: z.number(),
          bodyweight: z.array(z.string()),
          gym: z.array(z.string()),
        })
        .nullable(),
      meals: z.array(
        z.object({
          slot: slotValue,
          name: z.string(),
          how: z.string(),
          estimatedCost: z.number(),
        }),
      ),
      tip: z.string(),
    }),
  ),
});

// The exact JSON format Claude must follow (structured outputs). Written by
// hand so the allowed values (enums) are enforced, not just suggested.
const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });
const strList = (description: string) => ({ type: "array", description, items: { type: "string" } });
export const planJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "days"],
  properties: {
    summary: str("Two friendly sentences about how this week is set up."),
    days: {
      type: "array",
      description: "Exactly 7 entries, Monday to Sunday",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "focus", "workout", "meals", "tip"],
        properties: {
          day: { type: "string", enum: [...DAY_VALUES] },
          focus: str('Short label, e.g. "Full-body strength" or "Rest day"'),
          workout: {
            description: "null on rest days",
            anyOf: [
              { type: "null" },
              {
                type: "object",
                additionalProperties: false,
                required: ["title", "minutes", "bodyweight", "gym"],
                properties: {
                  title: str(),
                  minutes: { type: "integer", description: "Workout length in minutes" },
                  bodyweight: strList("Simple steps for a no-equipment version"),
                  gym: strList("Simple steps for a gym version"),
                },
              },
            ],
          },
          meals: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["slot", "name", "how", "estimatedCost"],
              properties: {
                slot: { type: "string", enum: [...MEAL_SLOTS] },
                name: str(),
                how: str("One or two sentences: where to get it or how to make it"),
                estimatedCost: { type: "number", description: "Estimated US dollars spent outside a meal plan; 0 if covered" },
              },
            },
          },
          tip: str("One short, practical tip for the day"),
        },
      },
    },
  },
} as const;

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
