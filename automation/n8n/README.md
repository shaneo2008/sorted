# n8n workflows

Three workflows. Build them in the n8n UI following these specs; export the
JSON back into this folder once working so they're version-controlled.

Shared credentials to set up in n8n first:
- **WhatsApp Cloud API** — Meta app + system user token + phone number id
- **HTTP Header Auth** — `X-Internal-Secret` for calling the API back
- **Google Calendar OAuth** — the trader's account (M4; single beta user first)

WhatsApp reality check (do this before anything else in M3): business-initiated
messages **must use pre-approved templates**. Draft and submit the four
templates below in Meta Business Manager on day one — approval takes 1–3 days
and blocks all testing. Free-form replies are only allowed inside a 24h window
after the *client* messages you.

## Message templates (submit to Meta)

| Template name        | Variables | Body sketch |
|----------------------|-----------|-------------|
| booking_confirmation | business, service, date, location | "Hi {{1}}! Your {{2}} booking with {{3}} is confirmed for {{4}}…" |
| booking_reminder     | business, service, date | "Reminder: your {{1}} appointment with {{2}} is tomorrow at {{3}}…" |
| payment_request      | business, amount, service, link | "…you can pay €{{2}} for {{3}} here: {{4}}" |
| review_request       | business, review_link | "Thanks for choosing {{1}}! If you had a good experience, a review means a lot: {{2}}" |

Keep them warm and short — these arrive as texts from a small business, not a
corporation.

## Workflow 1: `event-router`

**Trigger:** Webhook node (POST). Its URL is the API's `N8N_WEBHOOK_URL`.

**Switch on `$json.event`:**

- `booking.confirmed` →
  1. IF `client.phone` present → WhatsApp send `booking_confirmation`
  2. (M4) Google Calendar: create event in trader's calendar
     (title `{{service}} — {{client.name}}`, start/end, location)
     → PATCH `/api/internal/bookings/{{booking.id}}` with `gcal_event_id`
  3. POST `/api/internal/messages` (log the send, status from WhatsApp node)
- `booking.completed` → nothing messaging-wise (payment link event follows);
  reserved for future hooks
- `booking.cancelled` →
  1. (M4) IF `booking.gcal_event_id` → Google Calendar delete
  2. optional WhatsApp cancellation notice (skip for beta; cancellations are
     often phone calls anyway)
- `payment.link_created` →
  1. WhatsApp send `payment_request` with `payment.link_url`
  2. POST `/api/internal/messages`
- `payment.paid` → nothing for beta. (Future: thank-you message / trader push
  notification.)

**Error handling:** on WhatsApp node failure, still POST `/api/internal/messages`
with `status: "failed"` and the error in `meta` — visibility beats retries at
this stage.

## Workflow 2: `reminder-cron`

**Trigger:** Schedule, every 15 minutes.

1. GET `/api/internal/reminders?window_hours=24`
2. Loop items → WhatsApp send `booking_reminder`
3. Per item: PATCH `/api/internal/bookings/:id` `{ reminder_sent_at: now }`
   ← do this even on send failure, so a broken number doesn't retry forever;
   the failure is visible in message_log
4. POST `/api/internal/messages` per send

## Workflow 3: `review-cron`

**Trigger:** Schedule, daily 10:00 (nobody wants a review ask at 7am).

1. GET `/api/internal/reviews`
2. Loop → WhatsApp send `review_request` with the trader's `review_link`
3. PATCH `review_requested_at`, POST `/api/internal/messages`

## Testing tips

- Meta gives you a test phone number that can message up to 5 recipients
  without template approval — enough to build workflows while templates are
  in review.
- Use your own number as the "client" for the whole of M3.
- n8n's "Execute workflow with test data" + a saved sample of each event JSON
  (copy from `packages/core/src/events.ts` shapes) makes iteration fast.
