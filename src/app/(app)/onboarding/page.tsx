import { requireSession } from "@/lib/session";
import { getProfile } from "@/lib/profile";
import OnboardingForm from "./OnboardingForm";

export const metadata = { title: "Set up your week · Campus Reset" };

export default async function OnboardingPage() {
  const { user } = await requireSession();
  const profile = await getProfile(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {profile ? "Update your preferences" : `Hi ${user.name}, let's set up your week`}
      </h1>
      <p className="mt-2 text-stone-600">Five quick questions. You can change these anytime.</p>
      <OnboardingForm
        initial={
          profile
            ? {
                goal: profile.goal,
                availability: profile.availability,
                eatingSituation: profile.eatingSituation,
                weeklyBudget: profile.weeklyBudget,
                experienceLevel: profile.experienceLevel,
              }
            : null
        }
      />
    </div>
  );
}
