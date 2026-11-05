import Link from "next/link";
import { requireSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";

// Every page inside (app) is private: this checks the login on the server.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const links = [
    { href: "/plan", label: "Plan" },
    { href: "/replan", label: "Re-plan" },
    { href: "/grocery", label: "Grocery" },
    { href: "/account", label: "Account" },
  ];
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4">
          <Link href="/plan" className="font-bold tracking-tight text-emerald-800">Campus Reset</Link>
          <LogoutButton />
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pb-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-600 hover:bg-stone-100">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">{children}</main>
    </div>
  );
}
