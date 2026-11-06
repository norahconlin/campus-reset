"use client";

import { useEffect, useState } from "react";
import type { StoredPlan } from "@/lib/plan-schema";
import { setCheckoff } from "./actions";

const DAY_NAMES: Record<string, string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const JS_DAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const SLOT_LABEL: Record<string, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack" };

function CheckRow({
  checked, onToggle, title, meta, children,
}: {
  checked: boolean; onToggle: () => void; title: string; meta?: string; children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`Mark "${title}" as ${checked ? "not done" : "done"}`}
        onClick={onToggle}
        className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border-2 transition ${
          checked ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white hover:border-emerald-700"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`font-medium ${checked ? "text-stone-400 line-through" : ""}`}>{title}</p>
        {meta && <p className="text-sm text-stone-500">{meta}</p>}
        {children}
      </div>
    </div>
  );
}

export default function PlanView({ planId, plan, doneKeys }: { planId: string; plan: StoredPlan; doneKeys: string[] }) {
  const [done, setDone] = useState(() => new Set(doneKeys));
  const [error, setError] = useState("");
  const [today, setToday] = useState<string | null>(null);
  const [version, setVersion] = useState<Record<string, "bodyweight" | "gym">>({});

  // "Today" uses the phone's own clock, so it's right in every time zone.
  useEffect(() => setToday(JS_DAY[new Date().getDay()]), []);

  async function toggle(day: string, itemType: "workout" | "meal", itemId: string) {
    const key = `${day}:${itemType}:${itemId}`;
    const next = !done.has(key);
    setDone((s) => { const c = new Set(s); if (next) c.add(key); else c.delete(key); return c; });
    setError("");
    const result = await setCheckoff({ planId, day, itemType, itemId, done: next });
    if (result.error) {
      setDone((s) => { const c = new Set(s); if (next) c.delete(key); else c.add(key); return c; });
      setError(result.error);
    }
  }

  const total = plan.days.reduce((n, d) => n + (d.workout ? 1 : 0) + d.meals.length, 0);
  const weekCost = plan.days.reduce((n, d) => n + d.meals.reduce((m, x) => m + x.estimatedCost, 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-emerald-50 p-5">
        <p className="text-emerald-900">{plan.summary}</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-emerald-900">
          <span><strong className="tabular-nums">{done.size}</strong> of {total} done</span>
          <span>Estimated food spending: <strong className="tabular-nums">${weekCost.toFixed(0)}</strong></span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100" aria-hidden="true">
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${total ? (done.size / total) * 100 : 0}%` }} />
        </div>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      {plan.days.map((d) => {
        const isToday = d.day === today;
        const v = version[d.day] ?? "bodyweight";
        return (
          <section
            key={d.day}
            className={`rounded-2xl border bg-white p-5 ${isToday ? "border-emerald-700 ring-1 ring-emerald-700" : "border-stone-200"}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">
                {DAY_NAMES[d.day]}
                {isToday && <span className="ml-2 rounded-full bg-emerald-700 px-2 py-0.5 align-middle text-xs font-semibold text-white">Today</span>}
              </h2>
              <span className="text-sm font-medium text-stone-500">{d.focus}</span>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {d.workout ? (
                <CheckRow
                  checked={done.has(`${d.day}:workout:${d.workout.id}`)}
                  onToggle={() => toggle(d.day, "workout", d.workout!.id)}
                  title={d.workout.title}
                  meta={`Workout · ${d.workout.minutes} min`}
                >
                  <div className="mt-2 inline-flex rounded-full bg-stone-100 p-0.5 text-xs font-semibold" role="group" aria-label="Workout version">
                    {(["bodyweight", "gym"] as const).map((opt) => (
                      <button key={opt} type="button" aria-pressed={v === opt}
                        onClick={() => setVersion((s) => ({ ...s, [d.day]: opt }))}
                        className={`rounded-full px-3 py-1 ${v === opt ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}>
                        {opt === "bodyweight" ? "No equipment" : "Gym"}
                      </button>
                    ))}
                  </div>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-700">
                    {d.workout[v].map((step, i) => <li key={i}>{step.replace(/^\d+[.)]\s*/, "")}</li>)}
                  </ol>
                </CheckRow>
              ) : (
                <p className="text-sm text-stone-500">Rest day. A short walk or stretch is a nice option.</p>
              )}

              {d.meals.map((m) => (
                <CheckRow
                  key={m.id}
                  checked={done.has(`${d.day}:meal:${m.id}`)}
                  onToggle={() => toggle(d.day, "meal", m.id)}
                  title={m.name}
                  meta={`${SLOT_LABEL[m.slot] ?? m.slot}${m.estimatedCost > 0 ? ` · about $${m.estimatedCost.toFixed(2)}` : ""}`}
                >
                  <p className="mt-1 text-sm text-stone-600">{m.how}</p>
                </CheckRow>
              ))}
            </div>

            <p className="mt-4 border-t border-stone-100 pt-3 text-sm text-stone-600">
              <span className="font-semibold text-stone-700">Tip: </span>{d.tip}
            </p>
          </section>
        );
      })}

      <p className="text-sm text-stone-500">{plan.disclaimer}</p>
    </div>
  );
}
