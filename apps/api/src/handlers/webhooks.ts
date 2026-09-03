import { Hono } from "hono";

export const webhookRoutes = new Hono();

/**
 * POST /api/webhooks/stripe
 * TODO(M2):
 *   1. const sig = c.req.header("stripe-signature")
 *   2. stripe.webhooks.constructEvent(await c.req.text(), sig,
 *      env.stripeWebhookSecret()) — MUST use the raw text body
 *   3. On "checkout.session.completed" (payment links fire this):
 *      payment_id = event.data.object.metadata.payment_id
 *      → set status=paid, paidAt, method=stripe
 *      → emitEvent("payment.paid", …)
 *   4. Always return 200 fast; do nothing slow here.
 * Local testing: `stripe listen --forward-to localhost:3001/api/webhooks/stripe`
 */
webhookRoutes.post("/stripe", async (c) => {
  return c.json({ error: "Not implemented (M2)" }, 501);
});
