# Campus Reset — Project Brief for Claude Code

## What we're building
Campus Reset is a web app that helps college students build a weekly workout and meal routine
that fits their real schedule, budget, and campus food situation (dining hall, dorm, or apartment).

**Target customer:** College students on a dining plan or living in dorms who want to work out and
eat healthier but struggle with packed class/work schedules and tight budgets.

**AI feature (the reason people pay):** The student enters their schedule, goal, budget, and where
they eat — or types a plain-language update like "exam week, only 20 minutes a day and the dining
hall" — and the AI builds a personalized weekly plan (workouts + meals + grocery list), then
re-plans the rest of the week when they miss a day or their schedule changes.

## About me
I'm a student and new to coding. Please:
- Explain what you're doing in plain language before big changes.
- Make small, working steps instead of huge changes at once.
- Tell me exactly what to type or click when I need to do something outside the code
  (creating accounts, copying keys, settings in Vercel/Neon/Stripe).
- Never put secret keys in the code. Use `.env.local` and remind me to add the same
  variables in Vercel.

## Tech stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS — clean, friendly, mobile-first (students will use phones)
- **Database:** Neon Postgres, using Drizzle ORM
- **Auth:** Better Auth (email + password to start), users stored in Neon
- **AI:** Anthropic Claude API via the official `@anthropic-ai/sdk` package
  (use a Sonnet-class model; ask the model for structured JSON output)
- **Payments:** Stripe Checkout + Stripe Billing for a monthly subscription, with a webhook
  that marks the user as premium
- **Hosting:** Vercel, deployed from GitHub

## Environment variables (in `.env.local` and in Vercel)
- `DATABASE_URL` — Neon connection string
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

## Plans
- **Free:** account, onboarding, 1 AI-generated sample week, manual weekly planner, check-offs, streaks
- **Premium ($7.99/month):** unlimited AI weekly plans, AI re-planning, AI grocery lists

## Core pages
1. `/` — landing page (what it is, who it's for, pricing, sign-up button)
2. `/signup`, `/login`
3. `/onboarding` — goal, workout days/times, where they eat, weekly budget, experience level
4. `/plan` — this week's plan in a calendar/day view; check off workouts and meals
5. `/replan` — chat-style box: "what changed this week?" → AI updates the remaining days
6. `/grocery` — AI grocery list for the week (premium)
7. `/upgrade` — Stripe Checkout
8. `/account` — profile, subscription status, manage billing

## Database tables (starting point)
- `users` (handled by Better Auth) + `is_premium`, `stripe_customer_id`
- `profiles` — goal, available days/times, eating situation, budget, experience level
- `weekly_plans` — user_id, week_start, plan_json, created_at
- `checkoffs` — user_id, plan_id, day, item_type (workout/meal), item_id, done
- `ai_usage` — user_id, created_at, type (plan/replan/grocery) → used to enforce free-tier limits

## Rules for the AI feature
- General wellness only: no medical advice, no calorie or weight-loss targets, no supplements.
- Include a short note: "Not medical advice. Check with a doctor before starting a new exercise program."
- Workouts: beginner-friendly options, bodyweight and gym versions, 15–60 minutes.
- Meals: simple, budget-aware, matched to dining hall / dorm (microwave + mini fridge) / kitchen.
- Always return valid JSON matching a defined schema; validate it before saving.
- Check `ai_usage` before each AI call so free users can't run up costs.

## Working style
- Commit to git after each working feature with a clear message.
- Before saying a feature is done, run the app and check that it actually works.
