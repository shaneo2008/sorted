import { Hono } from "hono";

/**
 * Routes n8n calls back into. All guarded by X-Internal-Secret (see app.ts).
 * These are NOT user-scoped by JWT — n8n passes explicit ids from the event
 * payloads it received.
 */
export const internalRoutes = new Hono();

/** POST /api/internal/messages — n8n logs every WhatsApp send */
internalRoutes.post("/messages", async (c) => {
  // TODO(M3): body { user_id, booking_id?, client_id?, template, status,
  // meta? } → insert into messageLog. Validate template against the enum.
  return c.json({ error: "Not implemented (M3)" }, 501);
});

/**
 * GET /api/internal/reminders?window_hours=24
 * TODO(M3): bookings WHERE status='confirmed'
 *   AND start_at BETWEEN now() AND now()+window
 *   AND reminder_sent_at IS NULL
 * Join user + client (need phones + business name). n8n cron polls this
 * every 15 min, sends reminders, then PATCHes reminder_sent_at below.
 */
internalRoutes.get("/reminders", async (c) => {
  return c.json({ error: "Not implemented (M3)" }, 501);
});

/** PATCH /api/internal/bookings/:id — n8n writes back state */
internalRoutes.patch("/bookings/:id", async (c) => {
  // TODO(M3/M4): accept partial { gcal_event_id?, reminder_sent_at?,
  // review_requested_at? } and update. This one endpoint serves the
  // calendar workflow and both crons.
  return c.json({ error: "Not implemented (M3)" }, 501);
});

/**
 * GET /api/internal/reviews
 * TODO(M7): bookings WHERE status='completed'
 *   AND created "completed" ~2 days ago  ← simplest: add completed_at column
 *     in M2 when you implement /complete, or derive from updated timestamps
 *   AND review_requested_at IS NULL
 *   AND user has review_link set AND client has phone
 */
internalRoutes.get("/reviews", async (c) => {
  return c.json({ error: "Not implemented (M7)" }, 501);
});
