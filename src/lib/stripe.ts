import Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

// Keys come from environment variables (.env.local / Vercel), never the code.
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("STRIPE_SECRET_KEY is missing. Add it to Vercel.");
  return new Stripe(key);
}

// The site's own address, used for Stripe's "come back here" links.
export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").trim().replace(/\/$/, "");
}

// Subscription states that count as paid. "past_due" keeps access while
// Stripe retries a failed card; a cancelled subscription turns it off.
const ACTIVE = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

export async function setPremiumByCustomer(customerId: string, status: Stripe.Subscription.Status) {
  await db.update(user).set({ isPremium: ACTIVE.has(status), updatedAt: new Date() }).where(eq(user.stripeCustomerId, customerId));
}
