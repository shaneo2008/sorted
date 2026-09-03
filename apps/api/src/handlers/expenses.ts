import { Hono } from "hono";
import { CreateExpenseInput, ConfirmExpenseInput } from "@sorted/core";
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
 * POST /api/expenses — create with OCR suggestions.
 * TODO(M5):
 *   1. CreateExpenseInput.safeParse
 *   2. Insert row status=needs_review with whatever fields were given
 *   3. If receipt_key present: fetch image from S3, call vision model
 *      (Anthropic API, single message with base64 image, prompt: extract
 *      merchant, total incl. VAT in cents, date, best-fit category from the
 *      ExpenseCategory enum; respond ONLY with JSON). Store full response in
 *      ocrRaw, write suggestions into the nullable columns.
 *   4. Return the expense — the app shows a confirm screen.
 *   Never auto-confirm: OCR guesses must not silently become tax records.
 */
expenseRoutes.post("/", async (c) => {
  void CreateExpenseInput;
  return c.json({ error: "Not implemented (M5)" }, 501);
});

/** GET /api/expenses?year=&category=&status= */
expenseRoutes.get("/", async (c) => {
  // TODO(M5): scoped list, expenseDate desc, filters optional.
  return c.json({ error: "Not implemented (M5)" }, 501);
});

/** PATCH /api/expenses/:id — user confirms/corrects OCR → status=confirmed */
expenseRoutes.patch("/:id", async (c) => {
  void ConfirmExpenseInput;
  return c.json({ error: "Not implemented (M5)" }, 501);
});

expenseRoutes.delete("/:id", async (c) => {
  return c.json({ error: "Not implemented (M5)" }, 501);
});
