/** Local dev server. `pnpm dev` → http://localhost:3001 (loads .env via tsx) */
import { serve } from "@hono/node-server";
import { app } from "./app";
import { assertEnv } from "./lib/env";

assertEnv();
serve({ fetch: app.fetch, port: 3001 }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
