# Campus Reset — Build Prompts for Claude Code

Paste these into Claude Code one at a time, in order. Don't move on until the current step works.
After each step: test it in your browser, then say "commit this to git."

---

## Step 0 — Set up the project
> Read CLAUDE.md. Set up a new Next.js project with TypeScript and Tailwind in this folder.
> Create a simple homepage that says "Campus Reset" with a one-line description.
> Then explain how to run it locally and open it in my browser.

✅ Check: you see the homepage at http://localhost:3000

## Step 1 — Put it on GitHub and Vercel (go live early)
> Help me initialize git, create a GitHub repository called campus-reset, and push this code.
> Then walk me through connecting the repo to Vercel so the site is live.

✅ Check: you have a live vercel.app link

## Step 2 — Landing page
> Build the landing page from CLAUDE.md: headline, the problem, how it works (3 steps),
> free vs. premium pricing, and a sign-up button. Mobile-first, friendly, clean design.

## Step 3 — Database
> Connect the app to Neon using Drizzle. Walk me through creating the Neon project and
> getting my DATABASE_URL. Create the tables listed in CLAUDE.md.

✅ Check: the tables show up in the Neon dashboard

## Step 4 — Sign up and log in
> Add Better Auth with email and password. Create /signup and /login pages and protect
> /onboarding, /plan, /replan, /grocery and /account so only logged-in users can see them.

✅ Check: you can create an account, log out, and log back in

## Step 5 — Onboarding
> Build /onboarding: goal, which days and times I can work out, where I eat (dining hall,
> dorm, apartment), weekly food budget, and experience level. Save it to the profiles table,
> then send me to /plan.

## Step 6 — The AI weekly plan (the main feature)
> Walk me through getting an Anthropic API key from the Claude Console and adding it to
> .env.local. Then build the AI plan generator: take the user's profile and return a 7-day plan
> as JSON (workouts with simple steps, meals matched to where they eat, rest days).
> Follow the AI rules in CLAUDE.md. Save it to weekly_plans and show it on /plan
> as a day-by-day view with checkboxes.

✅ Check: you get a real, personalized plan, and check-offs stay saved after refreshing

## Step 7 — Re-planning
> Build /replan: a text box where I describe what changed ("missed Tuesday, exam Thursday,
> only 20 minutes a day"). Send it to the AI with my current plan and the days already
> checked off, and update only the remaining days.

## Step 8 — Grocery list
> Build /grocery: generate a grocery list from this week's meals, grouped by section, with
> estimated cost, staying within my budget. Mark this as a premium feature.

## Step 9 — Free-tier limits
> Use the ai_usage table so free users get 1 AI plan total, and premium users get
> unlimited plans, re-plans and grocery lists. Show an upgrade prompt when a free user hits the limit.

## Step 10 — Stripe payments
> Add Stripe in test mode. Walk me through creating a $7.99/month product and price in Stripe.
> Build /upgrade with Stripe Checkout, a webhook that sets is_premium = true when payment
> succeeds (and false if they cancel), and a "Manage billing" button on /account using the
> Stripe customer portal.

✅ Check: pay with Stripe's test card 4242 4242 4242 4242 (any future date, any CVC) and your
account turns premium

## Step 11 — Launch checklist
> Help me add all environment variables to Vercel, set up the Stripe webhook for the live URL,
> and test the full flow on the live site: sign up → onboarding → AI plan → upgrade → grocery list.
> Then review the code for security problems (exposed keys, unprotected pages, missing input checks).

---

## When something breaks
- Paste the **full error message** into Claude Code: "I got this error: [paste]. What's wrong?"
- If things get messy: "Undo your last change and let's try a smaller step."
- Commit often so you can always go back.
