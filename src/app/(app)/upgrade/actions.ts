"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { requireSession } from "@/lib/session";
import { appUrl, getStripe } from "@/lib/stripe";

async function getBillingUser(userId: string) {
  const rows = await db
    .select({ id: userTable.id, email: userTable.email, name: userTable.name, isPremium: userTable.isPremium, stripeCustomerId: userTable.stripeCustomerId })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);
  return rows[0];
}

// Sends the user to Stripe's secure checkout page for the $7.99/month plan.
export async function startCheckout(): Promise<{ error: string }> {
  const { user } = await requireSession();
  const me = await getBillingUser(user.id);
  if (me.isPremium) redirect("/account");

  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId || !process.env.STRIPE_SECRET_KEY) {
    return { error: "Payments aren't set up yet. Add the Stripe keys in Vercel." };
  }

  let url: string | null;
  try {
    const stripe = getStripe();
    let customerId = me.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: me.email, name: me.name, metadata: { userId: me.id } });
      customerId = customer.id;
      await db.update(userTable).set({ stripeCustomerId: customerId }).where(eq(userTable.id, me.id));
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: me.id,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { metadata: { userId: me.id } },
      success_url: `${appUrl()}/account?upgraded=1`,
      cancel_url: `${appUrl()}/upgrade`,
    });
    url = session.url;
  } catch (error) {
    console.error("Stripe checkout failed", error);
    return { error: "We couldn't open checkout. Try again in a minute." };
  }
  if (!url) return { error: "We couldn't open checkout. Try again in a minute." };
  redirect(url);
}

// Opens Stripe's customer portal to update the card or cancel.
export async function openBillingPortal(): Promise<{ error: string }> {
  const { user } = await requireSession();
  const me = await getBillingUser(user.id);
  if (!me.stripeCustomerId) return { error: "There's no billing account to manage yet." };

  let url: string;
  try {
    const portal = await getStripe().billingPortal.sessions.create({
      customer: me.stripeCustomerId,
      return_url: `${appUrl()}/account`,
    });
    url = portal.url;
  } catch (error) {
    console.error("Stripe portal failed", error);
    return { error: "We couldn't open billing. Try again in a minute." };
  }
  redirect(url);
}
