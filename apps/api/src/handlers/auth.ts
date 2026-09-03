import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { db, schema } from "../db";
import { issueJwt, requireAuth } from "../lib/auth";
import type { AppEnv } from "../app";

export const authRoutes = new Hono<AppEnv>();

/**
 * POST /api/auth/magic-link  { email }
 * M1: create user if new, log the login link to console.
 * M8: send via Resend/SES instead.
 */
authRoutes.post("/magic-link", async (c) => {
  const { email } = await c.req.json<{ email?: string }>();
  if (!email) return c.json({ error: "email required" }, 400);

  let [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()));
  if (!user) {
    [user] = await db
      .insert(schema.users)
      .values({ email: email.toLowerCase() })
      .returning();
  }

  // TODO(M1): issue a SHORT-lived (15 min) single-purpose token instead of a
  // session JWT, and verify it in /verify. This console-log version is a
  // dev convenience only.
  const token = await issueJwt(user.id);
  console.log(`\n🔑 Magic link: http://localhost:5173/login?token=${token}\n`);

  return c.json({ ok: true });
});

/** POST /api/auth/verify  { token } → { jwt, user } */
authRoutes.post("/verify", async (c) => {
  // TODO(M1): verify the short-lived token, look up user, issue the real
  // 30-day session JWT. For now the magic-link token IS the session token,
  // so just echo it back after verifying.
  const { token } = await c.req.json<{ token?: string }>();
  if (!token) return c.json({ error: "token required" }, 400);
  return c.json({ jwt: token });
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
