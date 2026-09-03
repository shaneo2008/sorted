/**
 * REFERENCE IMPLEMENTATION.
 *
 * This file demonstrates the pattern every handler follows:
 *   1. Validate input with the zod schema from @sorted/core (parse at the edge)
 *   2. Do the DB work with Drizzle, always scoped by userId
 *   3. Emit a domain event if something automation-worthy happened
 *   4. Return the row(s) — no wrapper envelopes, errors as { error }
 *
 * `create` and `confirm` are complete. list/get/patch/complete/cancel are
 * left as guided TODOs (M1/M2) — copy the shapes you see here.
 */
import { Hono } from "hono";
import { and, eq, gte, lte, desc } from "drizzle-orm";
import { CreateBookingInput, UpdateBookingInput } from "@sorted/core";
import { db, schema } from "../db";
import { emitEvent } from "../lib/events";
import type { AppEnv } from "../app";

export const bookingRoutes = new Hono<AppEnv>();

/** GET /api/bookings?from=&to=&status= */
bookingRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  const { from, to, status } = c.req.query();

  const conditions = [eq(schema.bookings.userId, userId)];
  if (from) conditions.push(gte(schema.bookings.startAt, new Date(from)));
  if (to) conditions.push(lte(schema.bookings.startAt, new Date(to)));
  if (status)
    conditions.push(eq(schema.bookings.status, status as never)); // TODO(M1): validate against BookingStatus enum

  const rows = await db
    .select({
      booking: schema.bookings,
      client: schema.clients,
    })
    .from(schema.bookings)
    .innerJoin(schema.clients, eq(schema.bookings.clientId, schema.clients.id))
    .where(and(...conditions))
    .orderBy(desc(schema.bookings.startAt));

  return c.json(rows);
});

/** POST /api/bookings — supports inline client creation (the 10-second flow) */
bookingRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  const parsed = CreateBookingInput.safeParse(await c.req.json());
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }
  const input = parsed.data;

  // Resolve or create the client
  let clientId = input.client_id;
  if (input.client) {
    const [client] = await db
      .insert(schema.clients)
      .values({ userId, ...input.client })
      .returning();
    clientId = client.id;
  } else {
    // Verify the referenced client belongs to this user
    const [client] = await db
      .select()
      .from(schema.clients)
      .where(
        and(
          eq(schema.clients.id, clientId!),
          eq(schema.clients.userId, userId),
        ),
      );
    if (!client) return c.json({ error: "Client not found" }, 404);
  }

  const [booking] = await db
    .insert(schema.bookings)
    .values({
      userId,
      clientId: clientId!,
      service: input.service,
      startAt: input.start_at,
      endAt: input.end_at,
      priceCents: input.price_cents,
      depositCents: input.deposit_cents,
      location: input.location,
      notes: input.notes,
    })
    .returning();

  return c.json(booking, 201);
});

/** POST /api/bookings/:id/confirm — enquiry → confirmed, emits automation */
bookingRoutes.post("/:id/confirm", async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");

  const [row] = await db
    .select({
      booking: schema.bookings,
      client: schema.clients,
    })
    .from(schema.bookings)
    .innerJoin(schema.clients, eq(schema.bookings.clientId, schema.clients.id))
    .where(
      and(eq(schema.bookings.id, id), eq(schema.bookings.userId, userId)),
    );

  if (!row) return c.json({ error: "Booking not found" }, 404);
  if (row.booking.status !== "enquiry") {
    return c.json(
      { error: `Cannot confirm a booking in status '${row.booking.status}'` },
      409,
    );
  }

  const [booking] = await db
    .update(schema.bookings)
    .set({ status: "confirmed" })
    .where(eq(schema.bookings.id, id))
    .returning();

  // Deposit expected? Create the pending payment row now.
  if (booking.depositCents > 0) {
    await db.insert(schema.payments).values({
      userId,
      bookingId: booking.id,
      kind: "deposit",
      amountCents: booking.depositCents,
    });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId));

  await emitEvent({
    event: "booking.confirmed",
    user: {
      id: user.id,
      business_name: user.businessName ?? user.name ?? "your vendor",
      phone: user.phone,
      review_link: user.reviewLink,
    },
    client: {
      id: row.client.id,
      name: row.client.name,
      phone: row.client.phone,
    },
    booking: {
      id: booking.id,
      service: booking.service,
      start_at: booking.startAt.toISOString(),
      price_cents: booking.priceCents,
      deposit_cents: booking.depositCents,
      location: booking.location,
      gcal_event_id: booking.gcalEventId,
    },
  });

  return c.json(booking);
});

/** GET /api/bookings/:id — booking + client + payments + message log */
bookingRoutes.get("/:id", async (c) => {
  // TODO(M1): fetch booking (scoped by userId, 404 if missing), then its
  // client, payments, and messageLog rows. Return one composed object.
  // Pattern: three awaited selects is fine at this scale — skip the mega-join.
  return c.json({ error: "Not implemented (M1)" }, 501);
});

/** PATCH /api/bookings/:id */
bookingRoutes.patch("/:id", async (c) => {
  // TODO(M1): UpdateBookingInput.safeParse → db.update scoped by id+userId.
  // Map snake_case input fields to camelCase columns (see create above).
  // If start_at changed on a confirmed booking, emit booking.confirmed again?
  // No — add a booking.rescheduled event later if beta users need it. For now
  // just update; the reminder cron reads startAt fresh anyway.
  void UpdateBookingInput;
  return c.json({ error: "Not implemented (M1)" }, 501);
});

/** POST /api/bookings/:id/complete — confirmed → completed */
bookingRoutes.post("/:id/complete", async (c) => {
  // TODO(M2): mirror /confirm exactly, except:
  //  - valid transition: confirmed → completed
  //  - create a "balance" payment row for (priceCents − sum of paid payments)
  //    if that remainder is > 0
  //  - emit "booking.completed" with the payment included
  return c.json({ error: "Not implemented (M2)" }, 501);
});

/** POST /api/bookings/:id/cancel */
bookingRoutes.post("/:id/cancel", async (c) => {
  // TODO(M1): any non-completed status → cancelled; also cancel pending
  // payments for this booking; emit "booking.cancelled" (n8n deletes gcal
  // event using booking.gcal_event_id).
  return c.json({ error: "Not implemented (M1)" }, 501);
});
