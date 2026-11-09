import Link from "next/link";
import ActionButton from "@/components/ActionButton";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireSession } from "@/lib/session";
import { openBillingPortal } from "../upgrade/actions";

export const metadata = { title: "Account · Campus Reset" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ upgraded?: string }> }) {
  const { user } = await requireSession();
  const { upgraded } = await searchParams;
  // Read fresh from the database so a just-finished payment shows right away.
  const [me] = await db
    .select({ isPremium: userTable.isPremium, stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, user.id))
    .limit(1);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>

      {upgraded && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-900">
          {me.isPremium
            ? "Payment complete. Welcome to Premium!"
            : "Payment received. Your Premium access is being switched on. Refresh in a few seconds."}
        </p>
      )}

      <dl className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Name</dt><dd>{user.name}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Email</dt><dd className="break-all">{user.email}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4">
          <dt className="text-stone-500">Plan</dt>
          <dd className="font-medium">{me.isPremium ? "Premium" : "Free"}</dd>
        </div>
      </dl>

      <div className="mt-6 flex max-w-sm flex-col gap-3">
        {!me.isPremium && (
          <Link href="/upgrade" className="rounded-full bg-emerald-700 px-6 py-3.5 text-center font-semibold text-white hover:bg-emerald-800">
            Upgrade to Premium
          </Link>
        )}
        {me.stripeCustomerId && (
          <ActionButton action={openBillingPortal} label="Manage billing" pendingLabel="Opening billing…" variant="secondary" />
        )}
      </div>
    </div>
  );
}
