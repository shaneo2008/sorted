import { Hono } from "hono";
import { MarkPaidInput } from "@sorted/core";
import type { AppEnv } from "../app";

export const paymentRoutes = new Hono<AppEnv>();

/** GET /api/payments?status=pending — the "who owes me" view */
paymentRoutes.get("/", async (c) => {
  // TODO(M2): join payments → bookings → clients, filter by userId + status,
  // order by createdAt desc. Return client name + service alongside amounts.
  return c.json({ error: "Not implemented (M2)" }, 501);
});

/**
 * POST /api/payments/:id/link — create Stripe Payment Link.
 * TODO(M2):
 *   1. Load payment (scoped by userId), must be status=pending, no link yet
 *   2. stripe.paymentLinks.create({
 *        line_items: [{ price_data: { currency, unit_amount, product_data:
 *          { name: `${service} — ${kind}` } }, quantity: 1 }],
 *        metadata: { payment_id }        ← how the webhook finds us
 *      })
 *      Note: payment links need a Price; simplest is an ad-hoc price via
 *      prices.create then paymentLinks.create, or use Checkout Sessions
 *      instead (also fine — sessions expire, links don't; links are nicer
 *      for WhatsApp). Decide in M2, contract stays the same.
 *   3. Save stripePaymentLinkId + linkUrl, set method=stripe
 *   4. emitEvent("payment.link_created", …) so n8n WhatsApps the link
 *   5. Return the payment
 */
paymentRoutes.post("/:id/link", async (c) => {
  return c.json({ error: "Not implemented (M2)" }, 501);
});

/** POST /api/payments/:id/mark-paid — cash / bank transfer */
paymentRoutes.post("/:id/mark-paid", async (c) => {
  // TODO(M2): MarkPaidInput.safeParse → set status=paid, method, paidAt=now.
  // Emit "payment.paid". Reject if already paid (409).
  void MarkPaidInput;
  return c.json({ error: "Not implemented (M2)" }, 501);
});
