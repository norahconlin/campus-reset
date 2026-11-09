import Link from "next/link";
import ActionButton from "@/components/ActionButton";
import { requireSession } from "@/lib/session";
import { isPremium } from "@/lib/usage";
import { startCheckout } from "./actions";

export const metadata = { title: "Go Premium · Campus Reset" };

const perks = [
  "A fresh AI plan every week, as often as you like",
  "AI re-planning when you miss a day or your week changes",
  "AI grocery lists that stay within your budget",
];

export default async function UpgradePage() {
  const { user } = await requireSession();
  const premium = await isPremium(user.id);

  if (premium) {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight">You&apos;re Premium 🎉</h1>
        <p className="mt-2 text-stone-600">You already have every feature.</p>
        <Link href="/plan" className="mt-6 inline-block font-semibold text-emerald-800 underline">Go to my plan</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold tracking-tight">Go Premium</h1>
      <p className="mt-2 text-stone-600">Let the AI plan every week, and fix it when life gets in the way.</p>
      <div className="mt-6 rounded-2xl border-2 border-emerald-700 bg-white p-6">
        <p>
          <span className="text-4xl font-bold">$7.99</span>
          <span className="text-stone-500"> / month</span>
        </p>
        <ul className="mt-5 flex flex-col gap-3">
          {perks.map((p) => (
            <li key={p} className="flex gap-2">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-none fill-emerald-600">
                <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
              </svg>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <ActionButton action={startCheckout} label="Upgrade for $7.99/month" pendingLabel="Opening secure checkout…" />
        </div>
        <p className="mt-3 text-center text-sm text-stone-500">Secure payment by Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
}
