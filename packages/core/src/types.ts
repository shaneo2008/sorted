import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────

export const BookingStatus = z.enum([
  "enquiry",
  "confirmed",
  "completed",
  "cancelled",
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const PaymentKind = z.enum(["deposit", "balance", "full", "custom"]);
export type PaymentKind = z.infer<typeof PaymentKind>;

export const PaymentMethod = z.enum([
  "stripe",
  "revolut",
  "cash",
  "bank_transfer",
]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const PaymentStatus = z.enum(["pending", "paid", "cancelled"]);
export type PaymentStatus = z.infer<typeof PaymentStatus>;

export const ExpenseCategory = z.enum([
  "materials",
  "travel",
  "equipment",
  "software",
  "phone_internet",
  "insurance",
  "training",
  "marketing",
  "other",
]);
export type ExpenseCategory = z.infer<typeof ExpenseCategory>;

export const ExpenseStatus = z.enum(["needs_review", "confirmed"]);
export type ExpenseStatus = z.infer<typeof ExpenseStatus>;

export const MessageTemplate = z.enum([
  "confirmation",
  "reminder",
  "payment_request",
  "review_request",
]);
export type MessageTemplate = z.infer<typeof MessageTemplate>;

// E.164, e.g. +353871234567
export const Phone = z
  .string()
  .regex(/^\+[1-9]\d{6,14}$/, "Phone must be E.164, e.g. +353871234567");

// ─── Request schemas (validate at the edge, trust internally) ─────────────

export const CreateClientInput = z.object({
  name: z.string().min(1).max(200),
  phone: Phone.optional(),
  email: z.string().email().optional(),
  notes: z.string().max(2000).optional(),
});
export type CreateClientInput = z.infer<typeof CreateClientInput>;

export const UpdateClientInput = CreateClientInput.partial();

export const CreateBookingInput = z
  .object({
    // Either an existing client…
    client_id: z.string().uuid().optional(),
    // …or inline creation (the 10-second flow)
    client: CreateClientInput.optional(),
    service: z.string().min(1).max(200),
    start_at: z.coerce.date(),
    end_at: z.coerce.date().optional(),
    price_cents: z.number().int().nonnegative(),
    deposit_cents: z.number().int().nonnegative().default(0),
    location: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine((v) => !!v.client_id !== !!v.client, {
    message: "Provide exactly one of client_id or client",
  })
  .refine((v) => v.deposit_cents <= v.price_cents, {
    message: "Deposit cannot exceed price",
  });
export type CreateBookingInput = z.infer<typeof CreateBookingInput>;

export const UpdateBookingInput = z.object({
  service: z.string().min(1).max(200).optional(),
  start_at: z.coerce.date().optional(),
  end_at: z.coerce.date().optional(),
  price_cents: z.number().int().nonnegative().optional(),
  deposit_cents: z.number().int().nonnegative().optional(),
  location: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

export const MarkPaidInput = z.object({
  method: PaymentMethod.exclude(["stripe"]), // stripe paid only via webhook
});

export const CreateExpenseInput = z.object({
  receipt_key: z.string().optional(), // S3 key from /expenses/upload-url
  merchant: z.string().max(200).optional(),
  amount_cents: z.number().int().positive().optional(),
  category: ExpenseCategory.optional(),
  expense_date: z.coerce.date().optional(),
});

export const ConfirmExpenseInput = z.object({
  merchant: z.string().min(1).max(200),
  amount_cents: z.number().int().positive(),
  category: ExpenseCategory,
  expense_date: z.coerce.date(),
});

// ─── Response types (plain interfaces; DB rows map to these) ──────────────

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  service: string;
  start_at: string;
  end_at: string | null;
  price_cents: number;
  deposit_cents: number;
  status: BookingStatus;
  location: string | null;
  notes: string | null;
  gcal_event_id: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  kind: PaymentKind;
  amount_cents: number;
  method: PaymentMethod | null;
  status: PaymentStatus;
  link_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  merchant: string | null;
  amount_cents: number | null;
  category: ExpenseCategory | null;
  expense_date: string | null;
  receipt_key: string | null;
  status: ExpenseStatus;
  created_at: string;
}

export interface ReportSummary {
  year: number;
  income_cents: number;
  expenses_cents: number;
  profit_cents: number;
  by_month: Array<{
    month: number; // 1–12
    income_cents: number;
    expenses_cents: number;
  }>;
  expenses_by_category: Array<{
    category: ExpenseCategory;
    total_cents: number;
  }>;
}
