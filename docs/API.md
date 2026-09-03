# API contract

Base URL: `/api`. Auth: `Authorization: Bearer <jwt>` on everything except
`/auth/*` and `/webhooks/*`. Internal routes use `X-Internal-Secret`.

All money is integer cents. All timestamps ISO 8601 UTC. Request/response
shapes are the zod schemas in `packages/core/src/types.ts` — this doc lists
routes and semantics; the schemas are the source of truth for fields.

## Auth
| Method | Path                | Notes |
|--------|---------------------|-------|
| POST   | /auth/magic-link    | body `{email}` → sends login link (M1: log to console) |
| POST   | /auth/verify        | body `{token}` → `{jwt, user}` |
| GET    | /auth/me            | current user |

## Clients
| Method | Path          | Notes |
|--------|---------------|-------|
| GET    | /clients      | list, `?q=` name search |
| POST   | /clients      | create (name required, rest optional — 10-second rule) |
| GET    | /clients/:id  | includes booking history + lifetime value |
| PATCH  | /clients/:id  | |
| DELETE | /clients/:id  | M8: GDPR cascade |

## Bookings
| Method | Path                    | Notes |
|--------|-------------------------|-------|
| GET    | /bookings               | `?from=&to=&status=` |
| POST   | /bookings               | inline client create supported: pass `client` object instead of `client_id` |
| GET    | /bookings/:id           | includes client, payments, message log |
| PATCH  | /bookings/:id           | field edits |
| POST   | /bookings/:id/confirm   | enquiry→confirmed. Emits `booking.confirmed`. Creates deposit payment row if deposit_cents > 0 |
| POST   | /bookings/:id/complete  | confirmed→completed. Emits `booking.completed`. Creates balance payment row |
| POST   | /bookings/:id/cancel    | emits `booking.cancelled` |

## Payments
| Method | Path                     | Notes |
|--------|--------------------------|-------|
| GET    | /payments                | `?status=pending` = the "who owes me" view |
| POST   | /payments/:id/link       | creates Stripe Payment Link, stores url, emits `payment.link_created` (n8n WhatsApps it) |
| POST   | /payments/:id/mark-paid  | manual: body `{method}` (cash/bank_transfer). Emits `payment.paid` |

## Expenses
| Method | Path                    | Notes |
|--------|-------------------------|-------|
| POST   | /expenses/upload-url    | → presigned S3 PUT url + `receipt_key` |
| POST   | /expenses               | body includes `receipt_key`; triggers OCR; returns expense with `status=needs_review` + OCR suggestions |
| GET    | /expenses               | `?year=&category=&status=` |
| PATCH  | /expenses/:id           | confirm/correct OCR fields → `status=confirmed` |
| DELETE | /expenses/:id           | |

## Reports
| Method | Path                  | Notes |
|--------|-----------------------|-------|
| GET    | /reports/summary      | `?year=` → income, expenses, profit, by month + category (dashboard) |
| GET    | /reports/export       | `?year=&format=csv` → accountant export (income lines + expense lines) |

## Webhooks (no JWT)
| Method | Path              | Notes |
|--------|-------------------|-------|
| POST   | /webhooks/stripe  | verify signature; `checkout.session.completed` / `payment_link` events → mark paid, emit `payment.paid` |

## Internal (n8n → API, `X-Internal-Secret`)
| Method | Path                 | Notes |
|--------|----------------------|-------|
| POST   | /internal/messages   | n8n logs each WhatsApp send |
| GET    | /internal/reminders  | `?window=24h` → bookings needing a reminder (n8n cron polls this) |
| GET    | /internal/reviews    | bookings completed 2 days ago, review not yet requested |
| PATCH  | /internal/bookings/:id/gcal | n8n writes back `gcal_event_id` |

## Domain events (API → n8n webhook)

Single endpoint `N8N_WEBHOOK_URL`, JSON body:

```json
{
  "event": "booking.confirmed",
  "user": { "id": "...", "business_name": "...", "phone": "..." },
  "booking": { "...": "full booking incl. client" },
  "payment": { "optional, for payment.* events": true }
}
```

Events: `booking.confirmed`, `booking.completed`, `booking.cancelled`,
`payment.link_created`, `payment.paid`. Fire-and-forget with 2s timeout;
failures logged, never block the response.
