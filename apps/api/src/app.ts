import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { requireAuth, requireInternalSecret } from "./lib/auth";
import { authRoutes } from "./handlers/auth";
import { clientRoutes } from "./handlers/clients";
import { bookingRoutes } from "./handlers/bookings";
import { paymentRoutes } from "./handlers/payments";
import { expenseRoutes } from "./handlers/expenses";
import { reportRoutes } from "./handlers/reports";
import { webhookRoutes } from "./handlers/webhooks";
import { internalRoutes } from "./handlers/internal";

export type AppEnv = { Variables: { userId: string } };

export const app = new Hono<AppEnv>();

app.use(logger());
app.use("/api/*", cors()); // TODO(M8): restrict origin to prod domain

app.get("/api/health", (c) => c.json({ ok: true }));

// Public
app.route("/api/auth", authRoutes);
app.route("/api/webhooks", webhookRoutes);

// Authenticated
app.use("/api/clients/*", requireAuth);
app.use("/api/bookings/*", requireAuth);
app.use("/api/payments/*", requireAuth);
app.use("/api/expenses/*", requireAuth);
app.use("/api/reports/*", requireAuth);
app.route("/api/clients", clientRoutes);
app.route("/api/bookings", bookingRoutes);
app.route("/api/payments", paymentRoutes);
app.route("/api/expenses", expenseRoutes);
app.route("/api/reports", reportRoutes);

// n8n callbacks
app.use("/api/internal/*", requireInternalSecret);
app.route("/api/internal", internalRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal error" }, 500);
});
