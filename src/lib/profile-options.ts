import { z } from "zod";

// Shared by the onboarding form (browser) and the save action (server),
// so both agree on what's allowed.

export const GOALS = [
  { value: "strength", label: "Build strength", hint: "Get stronger with simple, steady progress" },
  { value: "energy", label: "Have more energy", hint: "Feel less drained between classes" },
  { value: "stress", label: "Feel less stressed", hint: "Move to clear your head" },
  { value: "routine", label: "Build a routine", hint: "Show up consistently, even in busy weeks" },
] as const;

export const DAYS = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
] as const;

export const TIMES = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;

export const MINUTES = [15, 20, 30, 45, 60] as const;

export const EATING = [
  { value: "dining_hall", label: "Dining hall", hint: "I eat most meals on a meal plan" },
  { value: "dorm", label: "Dorm room", hint: "Microwave and mini fridge" },
  { value: "apartment", label: "Apartment", hint: "I have a full kitchen" },
] as const;

export const LEVELS = [
  { value: "beginner", label: "Beginner", hint: "New to working out, or getting back into it" },
  { value: "intermediate", label: "Intermediate", hint: "I work out sometimes and know the basics" },
  { value: "advanced", label: "Advanced", hint: "I train regularly" },
] as const;

const values = <T extends readonly { value: string }[]>(list: T) =>
  list.map((o) => o.value) as [T[number]["value"], ...T[number]["value"][]];

export const profileSchema = z.object({
  goal: z.enum(values(GOALS), { message: "Pick a goal." }),
  availability: z
    .array(
      z.object({
        day: z.enum(values(DAYS)),
        time: z.enum(values(TIMES)),
        minutes: z.union(MINUTES.map((m) => z.literal(m)) as [z.ZodLiteral<15>, ...z.ZodLiteral<number>[]]),
      }),
    )
    .min(1, "Pick at least one day you can work out.")
    .max(7)
    .refine((list) => new Set(list.map((d) => d.day)).size === list.length, "Each day can only appear once."),
  eatingSituation: z.enum(values(EATING), { message: "Pick where you eat." }),
  weeklyBudget: z
    .number({ message: "Enter your weekly food budget in dollars." })
    .int("Use whole dollars, like 40.")
    .min(0, "Budget can't be negative.")
    .max(500, "Enter a weekly budget of $500 or less."),
  experienceLevel: z.enum(values(LEVELS), { message: "Pick your experience level." }),
});

export type ProfileInput = z.infer<typeof profileSchema>;
