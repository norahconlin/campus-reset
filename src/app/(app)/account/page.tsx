import { requireSession } from "@/lib/session";

export const metadata = { title: "Account · Campus Reset" };

export default async function AccountPage() {
  const { user } = await requireSession();
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      <dl className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white">
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Name</dt><dd>{user.name}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Email</dt><dd className="break-all">{user.email}</dd></div>
        <div className="flex justify-between gap-4 px-5 py-4"><dt className="text-stone-500">Plan</dt><dd>{user.isPremium ? "Premium" : "Free"}</dd></div>
      </dl>
      <p className="mt-4 text-sm text-stone-500">Billing settings arrive in Step 10.</p>
    </div>
  );
}
