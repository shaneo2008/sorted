import { Hono } from "hono";
import type { AppEnv } from "../app";

export const reportRoutes = new Hono<AppEnv>();

/**
 * GET /api/reports/summary?year=2026 → ReportSummary (see @sorted/core)
 * TODO(M6): two aggregate queries + compose:
 *   income:   SELECT extract(month from paid_at) m, SUM(amount_cents)
 *             FROM payments WHERE user_id=$1 AND status='paid'
 *             AND paid_at within year GROUP BY m
 *   expenses: same over expenses (status='confirmed', expense_date), plus a
 *             GROUP BY category variant.
 * Drizzle: use sql`` template for extract(); keep it readable.
 */
reportRoutes.get("/summary", async (c) => {
  return c.json({ error: "Not implemented (M6)" }, 501);
});

/**
 * GET /api/reports/export?year=2026&format=csv
 * TODO(M6): stream two sections an accountant expects:
 *   INCOME:   date_paid, client, service, kind, method, amount_eur
 *   EXPENSES: date, merchant, category, amount_eur, has_receipt
 * Header row per section, amounts as decimal euro (cents/100, 2dp).
 * c.header("Content-Disposition", `attachment; filename=sorted-${year}.csv`)
 */
reportRoutes.get("/export", async (c) => {
  return c.json({ error: "Not implemented (M6)" }, 501);
});
