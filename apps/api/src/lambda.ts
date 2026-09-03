/** AWS Lambda entrypoint. Build with `pnpm build`, deploy dist/index.mjs. */
import { handle } from "hono/aws-lambda";
import { app } from "./app";

export const handler = handle(app);
