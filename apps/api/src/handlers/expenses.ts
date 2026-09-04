import { Hono } from "hono";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import {
  ConfirmExpenseInput,
  CreateExpenseInput,
  ExpenseCategory,
  ExpenseStatus,
} from "@sorted/core";
import { db, schema } from "../db";
import type { AppEnv } from "../app";

export const expenseRoutes = new Hono<AppEnv>();

/**
 * POST /api/expenses/upload-url
 * TODO(M5): presigned S3 PUT url.
 *   key = `${userId}/${crypto.randomUUID()}.jpg`
 *   @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner, 5 min expiry,
 *   content-type image/jpeg|png. Return { upload_url, receipt_key }.
 */
expenseRoutes.post("/upload-url", async (c) => {
  return c.json({ error: "Not implemented (M5)" }, 501);
});

/**
 * POST /api/expenses — create a reviewable expense.
 * A future OCR integration can fetch receipt images from S3, call a vision model,
 * and write suggestions into the nullable columns. OCR guesses must never
 * silently become tax records.
 */
expenseRoutes.post("/", async (c) => {
  const parsed = CreateExpenseInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const input = parsed.data;
  const [expense] = await db
    .insert(schema.expenses)
    .values({
      userId: c.get("userId"),
      receiptKey: input.receipt_key,
      merchant: input.merchant,
      amountCents: input.amount_cents,
      category: input.category,
      expenseDate: input.expense_date,
      status: "needs_review",
    })
    .returning();
  return c.json(expense, 201);
});

/** GET /api/expenses?year=&category=&status= */
expenseRoutes.get("/", async (c) => {
  const { year, category, status } = c.req.query();
  const conditions = [eq(schema.expenses.userId, c.get("userId"))];
  if (year) {
    const parsedYear = Number(year);
    if (!Number.isInteger(parsedYear)) return c.json({ error: "Invalid year" }, 400);
    conditions.push(
      gte(schema.expenses.expenseDate, new Date(`${parsedYear}-01-01T00:00:00Z`)),
      lt(schema.expenses.expenseDate, new Date(`${parsedYear + 1}-01-01T00:00:00Z`)),
    );
  }
  if (category) {
    const parsedCategory = ExpenseCategory.safeParse(category);
    if (!parsedCategory.success) return c.json({ error: "Invalid category" }, 400);
    conditions.push(eq(schema.expenses.category, parsedCategory.data));
  }
  if (status) {
    const parsedStatus = ExpenseStatus.safeParse(status);
    if (!parsedStatus.success) return c.json({ error: "Invalid status" }, 400);
    conditions.push(eq(schema.expenses.status, parsedStatus.data));
  }
  const expenses = await db
    .select()
    .from(schema.expenses)
    .where(and(...conditions))
    .orderBy(desc(schema.expenses.expenseDate));
  return c.json(expenses);
});

/** PATCH /api/expenses/:id — user confirms/corrects OCR → status=confirmed */
expenseRoutes.patch("/:id", async (c) => {
  const parsed = ConfirmExpenseInput.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400);
  const input = parsed.data;
  const [expense] = await db
    .update(schema.expenses)
    .set({
      merchant: input.merchant,
      amountCents: input.amount_cents,
      category: input.category,
      expenseDate: input.expense_date,
      status: "confirmed",
    })
    .where(
      and(
        eq(schema.expenses.id, c.req.param("id")),
        eq(schema.expenses.userId, c.get("userId")),
      ),
    )
    .returning();
  if (!expense) return c.json({ error: "Expense not found" }, 404);
  return c.json(expense);
});

expenseRoutes.delete("/:id", async (c) => {
  const [expense] = await db
    .delete(schema.expenses)
    .where(
      and(
        eq(schema.expenses.id, c.req.param("id")),
        eq(schema.expenses.userId, c.get("userId")),
      ),
    )
    .returning();
  if (!expense) return c.json({ error: "Expense not found" }, 404);
  return c.body(null, 204);
});
