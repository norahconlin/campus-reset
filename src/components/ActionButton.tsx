"use client";

import { useEffect, useState, useTransition } from "react";

// A button that runs a server action (like opening Stripe) and shows its error.
export default function ActionButton({
  action, label, pendingLabel, variant = "primary",
}: {
  action: () => Promise<{ error: string } | void>;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "secondary";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const style =
    variant === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800"
      : "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100";
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={!ready || pending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const result = await action();
            if (result?.error) setError(result.error);
          });
        }}
        className={`rounded-full px-6 py-3.5 font-semibold disabled:opacity-60 ${style}`}
      >
        {pending ? pendingLabel : label}
      </button>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    </div>
  );
}
