import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { aiPlanSchema, findPlanProblem, toStoredPlan, type StoredPlan } from "@/lib/plan-schema";
import { DAYS, EATING, GOALS, LEVELS } from "@/lib/profile-options";

// The API key is read from the ANTHROPIC_API_KEY environment variable.
// It is never written in the code.
const client = new Anthropic();

// Sonnet-class model, as the project brief asks.
const MODEL = "claude-sonnet-5-5";

export class PlanError extends Error {}

const SYSTEM_PROMPT = `You create weekly workout and meal plans for college students using the Campus Reset app.

Rules you must always follow:
- General wellness only. Never give medical advice, diagnoses, calorie targets, macro targets, weight-loss or weight-gain targets, or supplement suggestions.
- Workouts: only schedule them on the student's free days, and never longer than the minutes they have that day (15-60). Days without free time are rest days with workout set to null. Every workout has a bodyweight version (no equipment, works in a dorm room) and a gym version. Write steps a beginner can follow: exercise, sets and reps or time, and rest. Match intensity to their experience level.
- Meals: 3 meals per day plus an optional snack. Keep them simple and realistic for where they eat:
  - dining_hall: pick common dining hall options (salad bar, grill, stir-fry station, cereal, fruit). Cost is 0 for meal-plan meals; only snacks bought elsewhere cost money.
  - dorm: microwave and mini fridge only (oatmeal, yogurt, microwave rice, canned beans, sandwiches, fruit). No stove or oven.
  - apartment: a basic kitchen with simple, cheap recipes that use few ingredients.
- Keep the total estimated food spending for the week within the student's weekly budget.
- Tone: friendly, encouraging, practical. Short sentences. No guilt about missed days.`;

type ProfileForAi = {
  goal: string;
  availability: { day: string; time: string; minutes: number }[];
  eatingSituation: string;
  weeklyBudget: number;
  experienceLevel: string;
};

const label = (list: readonly { value: string; label: string }[], v: string) => list.find((o) => o.value === v)?.label ?? v;

function describeProfile(p: ProfileForAi) {
  const free = DAYS.map((d) => {
    const slot = p.availability.find((a) => a.day === d.value);
    return `- ${d.value}: ${slot ? `free in the ${slot.time} for up to ${slot.minutes} minutes` : "no workout time (rest day)"}`;
  }).join("\n");
  return `Build this week's plan for me.

Goal: ${label(GOALS, p.goal)}
Experience level: ${label(LEVELS, p.experienceLevel)}
Where I eat: ${p.eatingSituation} (${label(EATING, p.eatingSituation)})
Weekly food budget outside my meal plan: $${p.weeklyBudget}
My week:
${free}`;
}

export async function generateWeeklyPlan(profile: ProfileForAi): Promise<StoredPlan> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new PlanError("The AI isn't set up yet (ANTHROPIC_API_KEY is missing).");
  }

  let response;
  try {
    response = await client.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: "medium", format: zodOutputFormat(aiPlanSchema) },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: describeProfile(profile) }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) throw new PlanError("The AI is busy right now. Try again in a minute.");
    if (error instanceof Anthropic.AuthenticationError) throw new PlanError("The AI key isn't valid. Check ANTHROPIC_API_KEY.");
    if (error instanceof Anthropic.APIError) {
      console.error("Anthropic API error", error.status, error.message);
      throw new PlanError("The AI couldn't build a plan right now. Try again in a minute.");
    }
    // Anything else here means the reply didn't match our JSON format.
    console.error("Plan response could not be parsed", error);
    throw new PlanError("The plan came back in the wrong format. Try again.");
  }

  if (response.stop_reason === "refusal") throw new PlanError("The AI couldn't build this plan. Try changing your answers.");
  if (response.stop_reason === "max_tokens") throw new PlanError("The plan came back incomplete. Try again.");
  const plan = response.parsed_output;
  if (!plan) throw new PlanError("The plan came back in the wrong format. Try again.");

  const problem = findPlanProblem(plan, profile.availability);
  if (problem) {
    console.error("Rejected AI plan:", problem);
    throw new PlanError("The plan didn't match your schedule. Try again.");
  }
  return toStoredPlan(plan);
}
