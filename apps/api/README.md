# api

Hono app that runs identically as a local Node server and a single AWS Lambda.

## Local dev
```bash
cp .env.example .env   # fill DATABASE_URL + JWT_SECRET at minimum
pnpm db:push           # create tables in Neon
pnpm dev               # http://localhost:3001/api/health
```

## Deploy (M8)
```bash
pnpm build             # → dist/index.mjs (single bundled ESM file)
```
Create a Lambda (nodejs20.x, arm64, 512MB, 15s timeout), upload dist/,
handler `index.handler`, enable a Function URL (auth NONE — the app does its
own auth), set env vars from .env.example. Later swap in API Gateway +
custom domain if you want; nothing in the code changes.

## Conventions
- Every handler validates with @sorted/core zod schemas, scopes every query
  by userId, and returns plain rows. See handlers/bookings.ts (reference).
- Money is integer cents everywhere. Timestamps are timestamptz.
- Side-effects (WhatsApp/Calendar) never happen here — emit events instead
  (lib/events.ts).
