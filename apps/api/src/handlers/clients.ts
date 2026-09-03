import { Hono } from "hono";
import { CreateClientInput, UpdateClientInput } from "@sorted/core";
import type { AppEnv } from "../app";

/**
 * TODO(M1): implement all routes. Copy the pattern from bookings.ts:
 * zod parse → drizzle scoped by userId → plain json response.
 */
export const clientRoutes = new Hono<AppEnv>();

clientRoutes.get("/", async (c) => {
  // TODO(M1): list clients for userId. Support ?q= with ilike on name.
  return c.json({ error: "Not implemented (M1)" }, 501);
});

clientRoutes.post("/", async (c) => {
  // TODO(M1): CreateClientInput.safeParse → insert → 201.
  void CreateClientInput;
  return c.json({ error: "Not implemented (M1)" }, 501);
});

clientRoutes.get("/:id", async (c) => {
  // TODO(M1): client + their bookings (desc by startAt) + lifetime value
  // (SUM of paid payments across their bookings).
  return c.json({ error: "Not implemented (M1)" }, 501);
});

clientRoutes.patch("/:id", async (c) => {
  void UpdateClientInput;
  return c.json({ error: "Not implemented (M1)" }, 501);
});

clientRoutes.delete("/:id", async (c) => {
  // TODO(M8): GDPR cascade — delete messages, payments, bookings, client.
  // Wrap in a transaction. Require a confirm flag in the body.
  return c.json({ error: "Not implemented (M8)" }, 501);
});
