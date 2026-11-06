import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { DAYS, EATING, GOALS, LEVELS, TIMES } from "@/lib/profile-options";

export const metadata = { title: "This week's plan · Campus Reset" };

const labelOf = (list: readonly { value: string; label: string }[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

export default async function PlanPage() {
  const { user } = await requireSession();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">This week&apos;s plan</h1>
      <p className="mt-2 text-stone-600">Your AI-built plan arrives in Step 6. Here&apos;s what it will be based on:</p>

      <dl className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Goal</dt><dd className="text-right">{labelOf(GOALS, profile.goal)}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4">
          <dt className="text-stone-500">Workouts</dt>
          <dd className="text-right">
            {profile.availability.map((a) => (
              <div key={a.day}>{labelOf(DAYS, a.day)} · {labelOf(TIMES, a.time)} · {a.minutes} min</div>
            ))}
          </dd>
        </div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Meals</dt><dd className="text-right">{labelOf(EATING, profile.eatingSituation)}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Food budget</dt><dd className="text-right tabular-nums">${profile.weeklyBudget} / week</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Experience</dt><dd className="text-right">{labelOf(LEVELS, profile.experienceLevel)}</dd></div>
      </dl>

      <Link href="/onboarding" className="mt-4 inline-block text-sm font-semibold text-emerald-800 underline">
        Change my answers
      </Link>
    </div>
  );
}
