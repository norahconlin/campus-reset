"use client";

import { useEffect, useState, useTransition } from "react";
import { DAYS, EATING, GOALS, LEVELS, MINUTES, TIMES } from "@/lib/profile-options";
import { saveProfile } from "./actions";

type Slot = { time: string; minutes: number };
type Initial = {
  goal: string;
  availability: { day: string; time: string; minutes: number }[];
  eatingSituation: string;
  weeklyBudget: number;
  experienceLevel: string;
} | null;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-stone-200 pt-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
          {n}
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </fieldset>
  );
}

function Choice({
  name, value, label, hint, checked, onChange,
}: {
  name: string; value: string; label: string; hint?: string; checked: boolean; onChange: (v: string) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col rounded-xl border px-4 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-emerald-700 ${
        checked ? "border-emerald-700 bg-emerald-50" : "border-stone-300 bg-white hover:border-stone-400"
      }`}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className="font-medium">{label}</span>
      {hint && <span className="text-sm text-stone-600">{hint}</span>}
    </label>
  );
}

export default function OnboardingForm({ initial }: { initial: Initial }) {
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [slots, setSlots] = useState<Record<string, Slot | undefined>>(() =>
    Object.fromEntries((initial?.availability ?? []).map((a) => [a.day, { time: a.time, minutes: a.minutes }])),
  );
  const [eating, setEating] = useState(initial?.eatingSituation ?? "");
  const [budget, setBudget] = useState(initial ? String(initial.weeklyBudget) : "");
  const [level, setLevel] = useState(initial?.experienceLevel ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  function toggleDay(day: string) {
    setError("");
    setSlots((s) => ({ ...s, [day]: s[day] ? undefined : { time: "evening", minutes: 30 } }));
  }
  function updateSlot(day: string, patch: Partial<Slot>) {
    setSlots((s) => ({ ...s, [day]: { ...(s[day] as Slot), ...patch } }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const availability = DAYS.filter((d) => slots[d.value]).map((d) => ({ day: d.value, ...(slots[d.value] as Slot) }));
    const payload = {
      goal,
      availability,
      eatingSituation: eating,
      weeklyBudget: budget.trim() === "" ? undefined : Number(budget),
      experienceLevel: level,
    };
    startTransition(async () => {
      const result = await saveProfile(payload);
      if (result?.error) setError(result.error);
    });
  }

  const select =
    "rounded-lg border border-stone-300 bg-white px-2 py-2 text-sm outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/20";
  const chosenDays = DAYS.filter((d) => slots[d.value]);

  return (
    <form method="post" onSubmit={handleSubmit} onChange={() => error && setError("")} className="mt-8 flex flex-col gap-8">
      <Section n={1} title="What's your main goal?">
        <div className="grid gap-3 sm:grid-cols-2">
          {GOALS.map((g) => (
            <Choice key={g.value} name="goal" value={g.value} label={g.label} hint={g.hint} checked={goal === g.value} onChange={setGoal} />
          ))}
        </div>
      </Section>

      <Section n={2} title="When can you work out?">
        <p className="-mt-2 mb-3 text-sm text-stone-600">Tap the days you&apos;re usually free.</p>
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((d) => {
            const on = !!slots[d.value];
            return (
              <button
                key={d.value}
                type="button"
                aria-pressed={on}
                onClick={() => toggleDay(d.value)}
                className={`rounded-lg border py-2.5 text-sm font-semibold ${
                  on ? "border-emerald-700 bg-emerald-700 text-white" : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                }`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        {chosenDays.length > 0 && (
          <ul className="mt-4 flex flex-col divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {chosenDays.map((d) => {
              const slot = slots[d.value] as Slot;
              return (
                <li key={d.value} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <span className="w-10 font-medium">{d.label}</span>
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`time-${d.value}`}>{d.label} time</label>
                    <select id={`time-${d.value}`} className={select} value={slot.time}
                      onChange={(e) => updateSlot(d.value, { time: e.target.value })}>
                      {TIMES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <label className="sr-only" htmlFor={`min-${d.value}`}>{d.label} minutes</label>
                    <select id={`min-${d.value}`} className={select} value={slot.minutes}
                      onChange={(e) => updateSlot(d.value, { minutes: Number(e.target.value) })}>
                      {MINUTES.map((m) => <option key={m} value={m}>{m} min</option>)}
                    </select>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section n={3} title="Where do you eat most meals?">
        <div className="grid gap-3 sm:grid-cols-3">
          {EATING.map((o) => (
            <Choice key={o.value} name="eating" value={o.value} label={o.label} hint={o.hint} checked={eating === o.value} onChange={setEating} />
          ))}
        </div>
      </Section>

      <Section n={4} title="What's your weekly food budget?">
        <p className="-mt-2 mb-3 text-sm text-stone-600">
          Money you spend on food outside your meal plan. Enter 0 if it&apos;s all covered.
        </p>
        <div className="flex max-w-[12rem] items-center rounded-xl border border-stone-300 bg-white focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/20">
          <span className="pl-4 text-stone-500">$</span>
          <label htmlFor="budget" className="sr-only">Weekly budget in dollars</label>
          <input id="budget" inputMode="numeric" pattern="[0-9]*" value={budget}
            onChange={(e) => setBudget(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            placeholder="40" className="w-full rounded-xl bg-transparent px-2 py-3 text-base outline-none" />
          <span className="whitespace-nowrap pr-4 text-sm text-stone-500">/ week</span>
        </div>
      </Section>

      <Section n={5} title="How much workout experience do you have?">
        <div className="grid gap-3 sm:grid-cols-3">
          {LEVELS.map((o) => (
            <Choice key={o.value} name="level" value={o.value} label={o.label} hint={o.hint} checked={level === o.value} onChange={setLevel} />
          ))}
        </div>
      </Section>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <button type="submit" disabled={!ready || pending}
        className="rounded-full bg-emerald-700 px-6 py-3.5 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
        {pending ? "Saving…" : initial ? "Save changes" : "Save and see my plan"}
      </button>
    </form>
  );
}
