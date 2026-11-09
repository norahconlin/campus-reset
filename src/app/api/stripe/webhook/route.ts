import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";
import { getStripe, setPremiumByCustomer } from "@/lib/stripe";

export const runtime = "nodejs";

// Stripe calls this address when a payment succeeds or a subscription changes.
// The signature check proves the message really came from Stripe.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Webhook not configured", { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Stripe webhook signature check failed", error);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (userId && customerId && session.mode === "subscription" && session.status === "complete") {
          await db
            .update(user)
            .set({ isPremium: true, stripeCustomerId: customerId, updatedAt: new Date() })
            .where(eq(user.id, userId));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await setPremiumByCustomer(customerId, event.type === "customer.subscription.deleted" ? "canceled" : sub.status);
        break;
      }
    }
  } catch (error) {
    console.error("Stripe webhook handling failed", event.type, error);
    return new Response("Webhook handler failed", { status: 500 }); // Stripe will retry
  }

  return Response.json({ received: true });
}
