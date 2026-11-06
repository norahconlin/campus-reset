"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { generatePlan } from "./actions";

export default function GenerateButton({ label }: { label: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={!ready || pending}
        onClick={() => {
          setError("");
          startTransition(async () => {
            const result = await generatePlan();
            if (result.error) setError(result.error);
            setLimitReached(!!result.limitReached);
          });
        }}
        className="rounded-full bg-emerald-700 px-6 py-3.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Building your plan… (up to a minute)" : label}
      </button>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}{" "}
          {limitReached && <Link href="/account" className="font-semibold underline">See plans</Link>}
        </p>
      )}
    </div>
  );
}
