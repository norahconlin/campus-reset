"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

type Mode = "signup" | "login";

// Only allow redirects to pages on this site (blocks "//evil.com" tricks).
function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // The button stays disabled until the page's code has loaded, so the browser
  // can never fall back to a plain form submit that puts details in the URL.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = isSignup
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password });

    setLoading(false);
    if (result.error) {
      setError(friendlyError(result.error.code, result.error.message, isSignup));
      return;
    }
    router.push(isSignup ? "/onboarding" : safeNext(searchParams.get("next"), "/plan"));
    router.refresh();
  }

  const input =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";

  return (
    <div className="min-h-screen bg-stone-50 px-5 py-8">
      <div className="mx-auto max-w-sm">
        <Link href="/" className="text-lg font-bold tracking-tight text-emerald-800">
          Campus Reset
        </Link>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-stone-600">
          {isSignup ? "Free to start. No card needed." : "Log in to see this week's plan."}
        </p>

        <form method="post" onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          {isSignup && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">First name</label>
              <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)}
                required maxLength={60} autoComplete="given-name" />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input id="email" type="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)}
              required maxLength={254} autoComplete="email" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input id="password" type="password" className={input} value={password}
              onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={128}
              autoComplete={isSignup ? "new-password" : "current-password"} />
            {isSignup && <p className="text-sm text-stone-500">At least 8 characters.</p>}
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
          )}

          <button type="submit" disabled={!ready || loading}
            className="mt-2 rounded-full bg-emerald-700 px-6 py-3.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
            {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-600">
          {isSignup ? "Already have an account? " : "New to Campus Reset? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-emerald-800 underline">
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function friendlyError(code: string | undefined, message: string | undefined, isSignup: boolean) {
  if (code === "USER_ALREADY_EXISTS" || code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")
    return "There's already an account with this email. Try logging in instead.";
  if (code === "INVALID_EMAIL_OR_PASSWORD") return "That email and password don't match. Check them and try again.";
  if (code === "PASSWORD_TOO_SHORT") return "Your password needs at least 8 characters.";
  if (code === "INVALID_EMAIL") return "That email address doesn't look right. Check it and try again.";
  return message || (isSignup ? "We couldn't create your account. Try again." : "We couldn't log you in. Try again.");
}
