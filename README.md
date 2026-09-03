# Sorted

**You do the work. We track the money.**

Business admin for sole traders who hate admin. Client log, WhatsApp automation,
payment links, expense capture, one-click year-end report.

## Repo layout

```
sorted/
├── docs/
│   ├── ARCHITECTURE.md        # System design + why each choice was made
│   ├── API.md                 # Full REST contract (implement against this)
│   ├── DATA_MODEL.md          # Entity reference + state machines
│   └── IMPLEMENTATION_PLAN.md # Ordered milestones with acceptance criteria ← START HERE
├── apps/
│   ├── api/                   # AWS Lambda backend (TypeScript, Hono, Drizzle)
│   └── web/                   # PWA frontend (Vite + React, mobile-first)
├── packages/
│   └── core/                  # Shared types, zod schemas, event definitions
└── automation/
    └── n8n/                   # Workflow specs (build these in the n8n UI)
```

## Quick start

```bash
pnpm install

# 1. Database (Neon free tier: https://neon.tech)
cp apps/api/.env.example apps/api/.env   # fill DATABASE_URL
pnpm --filter api db:push                # push schema to Postgres

# 2. Run locally
pnpm --filter api dev                    # API on :3001
pnpm --filter web dev                    # PWA on :5173
```

## How this repo is organised for building

- `docs/IMPLEMENTATION_PLAN.md` is the task list. Milestones are ordered by
  dependency; each has acceptance criteria. Work top to bottom.
- `apps/api/src/handlers/bookings.ts` is **fully implemented** as the reference
  pattern (validation → DB → event emission). Every other handler is a stub
  with a TODO pointing back to it. Copy the pattern.
- `packages/core` is the source of truth for types. If the API and the web app
  disagree about a shape, core wins — fix the consumer.
- n8n owns all side-effects (WhatsApp, Google Calendar, review requests). The
  API never talks to Meta or Google directly; it emits events. See
  `automation/n8n/README.md`.

## Stack

| Layer      | Choice                          | Why (short version)                          |
|------------|---------------------------------|----------------------------------------------|
| API        | Hono on AWS Lambda              | Tiny, fast, runs locally without emulation    |
| DB         | Postgres (Neon) + Drizzle       | Year-end report = SQL aggregation             |
| Frontend   | Vite + React PWA                | Mobile-first, installable, no app-store tax   |
| Automation | n8n + Meta WhatsApp Cloud API   | Side-effects live outside the request path    |
| Payments   | Stripe Payment Links (Revolut later) | One integration to validate the flow     |

Full rationale in `docs/ARCHITECTURE.md`.
