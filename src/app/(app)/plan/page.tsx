import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import { getDoneKeys, getLatestPlan } from "@/lib/plans";
import { FREE_LIMITS, isPremium, usedCount } from "@/lib/usage";
import GenerateButton from "./GenerateButton";
import PlanView from "./PlanView";

export const metadata = { title: "This week's plan · Campus Reset" };
// Building a plan with AI can take up to a minute.
export const maxDuration = 120;

export default async function PlanPage() {
  const { user } = await requireSession();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/onboarding");

  const [latest, premium, used] = await Promise.all([
    getLatestPlan(user.id),
    isPremium(user.id),
    usedCount(user.id, "plan"),
  ]);
  const canGenerate = premium || used < FREE_LIMITS.plan;

  if (!latest) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your first plan</h1>
        <p className="mt-2 text-stone-600">
          We&apos;ll build 7 days of workouts and meals around your schedule, your budget and where you eat.
        </p>
        <div className="mt-6">
          {canGenerate ? (
            <GenerateButton label="Build my plan" />
          ) : (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
              You&apos;ve used your free AI plan. Premium plans arrive in Step 10.
            </p>
          )}
        </div>
        <Link href="/onboarding" className="mt-6 inline-block text-sm font-semibold text-emerald-800 underline">
          Change my answers
        </Link>
      </div>
    );
  }

  const doneKeys = await getDoneKeys(user.id, latest.id);
  const weekOf = new Date(`${latest.weekStart}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">This week&apos;s plan</h1>
          <p className="mt-1 text-sm text-stone-500">Week of {weekOf}</p>
        </div>
        <Link href="/onboarding" className="text-sm font-semibold text-emerald-800 underline">Change my answers</Link>
      </div>
      <PlanView planId={latest.id} plan={latest.plan} doneKeys={doneKeys} />
      {premium && (
        <div className="mt-8 border-t border-stone-200 pt-6">
          <GenerateButton label="Build a fresh plan" />
        </div>
      )}
    </div>
  );
}
