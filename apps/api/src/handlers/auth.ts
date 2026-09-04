import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db";
import {
  issueJwt,
  issueMagicLinkToken,
  requireAuth,
  verifyMagicLinkToken,
} from "../lib/auth";
import type { AppEnv } from "../app";

export const authRoutes = new Hono<AppEnv>();

/**
 * POST /api/auth/magic-link  { email }
 * M1: create user if new, log the login link to console.
 * M8: send via Resend/SES instead.
 */
authRoutes.post("/magic-link", async (c) => {
  const parsed = z
    .object({ email: z.string().email().transform((value) => value.toLowerCase()) })
    .safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Valid email required" }, 400);
  const { email } = parsed.data;

  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email));
  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({ email })
      .returning();
  }

  const token = await issueMagicLinkToken(user.id);
  console.log(`\n🔑 Magic link: http://localhost:5173/login?token=${token}\n`);

  return c.json({ ok: true });
});

/** POST /api/auth/verify  { token } → { jwt, user } */
authRoutes.post("/verify", async (c) => {
  const { token } = await c.req.json<{ token?: string }>();
  if (!token) return c.json({ error: "token required" }, 400);
  try {
    const userId = await verifyMagicLinkToken(token);
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json({ jwt: await issueJwt(userId), user });
  } catch {
    return c.json({ error: "Invalid or expired login link" }, 401);
  }
});

/** GET /api/auth/me */
authRoutes.get("/me", requireAuth, async (c) => {
  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, c.get("userId")));
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});
