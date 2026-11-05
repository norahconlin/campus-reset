import Link from "next/link";

const problems = [
  {
    title: "Your schedule changes every week",
    body: "Labs, shifts and exams move around. A fixed 5-day gym program falls apart by Wednesday.",
  },
  {
    title: "Your food options are limited",
    body: "A dining hall, a microwave and a mini fridge. Most meal plans assume a full kitchen.",
  },
  {
    title: "Your budget is tight",
    body: "Healthy eating advice often means expensive groceries you can't store in a dorm.",
  },
];

const steps = [
  {
    title: "Tell us about your week",
    body: "Your goal, when you're free to work out, where you eat and your weekly food budget. It takes about 2 minutes.",
  },
  {
    title: "Get your plan",
    body: "A 7-day plan with workouts (15–60 minutes, gym or bodyweight) and meals that match your dining hall, dorm or kitchen.",
  },
  {
    title: "Re-plan when life happens",
    body: "Missed Tuesday? Exam on Thursday? Type what changed and the rest of your week adjusts.",
  },
];

const freeFeatures = [
  "Your profile and preferences",
  "1 AI-generated sample week",
  "Manual weekly planner",
  "Check-offs and streaks",
];

const premiumFeatures = [
  "Everything in Free",
  "Unlimited AI weekly plans",
  "AI re-planning when your week changes",
  "AI grocery lists that stay within budget",
];

function Check() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 flex-none fill-emerald-600">
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Header */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <Link href="/" className="text-lg font-bold tracking-tight text-emerald-800">
          Campus Reset
        </Link>
        <Link
          href="/login"
          className="rounded-full px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-200"
        >
          Log in
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pb-16 pt-8 sm:pt-16">
          <p className="mb-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900">
            Built for dorms, dining halls and busy weeks
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-balance sm:text-6xl">
            A workout and meal routine that fits your <span className="text-emerald-700">real</span> week.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-stone-600">
            Campus Reset builds a weekly plan around your classes, your budget and the food you can actually get.
            When your week changes, so does your plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/signup"
              className="rounded-full bg-emerald-700 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm hover:bg-emerald-800"
            >
              Get my free plan
            </Link>
            <span className="text-sm text-stone-500 sm:ml-2">Free to start. No card needed.</span>
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Most fitness plans weren&apos;t made for college</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              {problems.map((p) => (
                <div key={p.title}>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="mt-2 text-stone-600">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="flex gap-4 sm:flex-col">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-2 text-stone-600">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 rounded-2xl bg-stone-100 p-5 text-stone-700">
            <p className="text-sm font-medium text-stone-500">Example re-plan</p>
            <p className="mt-1 font-mono text-sm">&ldquo;Missed Tuesday, exam Thursday, only 20 minutes a day this week.&rdquo;</p>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-16">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Pricing</h2>
            <p className="mt-2 text-stone-600">Start free. Upgrade when you want the AI to plan every week.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col rounded-2xl border border-stone-200 p-6">
                <h3 className="text-lg font-semibold">Free</h3>
                <p className="mt-2">
                  <span className="text-4xl font-bold">$0</span>
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex gap-2"><Check />{f}</li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 rounded-full border border-stone-300 px-6 py-3 text-center font-semibold hover:bg-stone-100"
                >
                  Start free
                </Link>
              </div>
              <div className="flex flex-col rounded-2xl border-2 border-emerald-700 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Premium</h3>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Most flexible</span>
                </div>
                <p className="mt-2">
                  <span className="text-4xl font-bold">$7.99</span>
                  <span className="text-stone-500"> / month</span>
                </p>
                <ul className="mt-6 flex flex-col gap-3">
                  {premiumFeatures.map((f) => (
                    <li key={f} className="flex gap-2"><Check />{f}</li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 rounded-full bg-emerald-700 px-6 py-3 text-center font-semibold text-white hover:bg-emerald-800"
                >
                  Sign up, then upgrade
                </Link>
                <p className="mt-3 text-center text-sm text-stone-500">Cancel anytime.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-5xl px-5 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">Ready for a week that works?</h2>
          <Link
            href="/signup"
            className="mt-6 inline-block rounded-full bg-emerald-700 px-8 py-3.5 font-semibold text-white shadow-sm hover:bg-emerald-800"
          >
            Get my free plan
          </Link>
        </section>
      </main>

      <footer className="border-t border-stone-200">
        <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-stone-500">
          <p>Not medical advice. Check with a doctor before starting a new exercise program.</p>
          <p className="mt-2">© {new Date().getFullYear()} Campus Reset</p>
        </div>
      </footer>
    </div>
  );
}
