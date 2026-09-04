import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BookingStatus = "enquiry" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid";

export interface Client {
  id: string;
  name: string;
  phone?: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  kind: "deposit" | "balance" | "full";
  amountCents: number;
  status: PaymentStatus;
  method?: "cash" | "bank_transfer" | "stripe";
  paidAt?: string;
}

export interface Booking {
  id: string;
  client: Client;
  service: string;
  startAt: string;
  priceCents: number;
  depositCents: number;
  status: BookingStatus;
  location?: string;
  notes?: string;
  messages: Array<{ label: string; sentAt: string }>;
}

export type ExpenseCategory =
  | "Materials"
  | "Travel"
  | "Equipment"
  | "Software"
  | "Phone & internet"
  | "Insurance"
  | "Training"
  | "Marketing"
  | "Other";

export interface Expense {
  id: string;
  merchant: string;
  amountCents: number;
  category: ExpenseCategory;
  date: string;
  hasReceipt: boolean;
}

interface Business {
  name: string;
  owner: string;
  phone: string;
  reviewLink: string;
}

interface StoreData {
  bookings: Booking[];
  payments: Payment[];
  expenses: Expense[];
  business: Business;
}

interface NewBooking {
  clientName: string;
  clientPhone?: string;
  service: string;
  startAt: string;
  priceCents: number;
  depositCents: number;
  location?: string;
  notes?: string;
}

interface StoreValue extends StoreData {
  addBooking: (booking: NewBooking) => Booking;
  confirmBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  cancelBooking: (id: string) => void;
  markPaid: (paymentId: string, method: Payment["method"]) => void;
  createPaymentLink: (paymentId: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateBusiness: (business: Business) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "sorted_demo_v2";

function at(daysFromNow: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function expenseDate(monthOffset: number, day: number) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthOffset, day);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function seedData(): StoreData {
  const bookings: Booking[] = [
    {
      id: "booking-sarah",
      client: { id: "client-sarah", name: "Sarah Keane", phone: "+353871234567" },
      service: "Bridal trial",
      startAt: at(0, 10),
      priceCents: 8000,
      depositCents: 2000,
      status: "confirmed",
      location: "Studio",
      notes: "Soft, natural look. Bring veil options.",
      messages: [
        { label: "Booking confirmation sent", sentAt: at(-5, 14, 2) },
        { label: "Reminder scheduled for 10:00 tomorrow", sentAt: at(-1, 10) },
      ],
    },
    {
      id: "booking-obrien",
      client: { id: "client-obrien", name: "Aoife O'Brien", phone: "+353861112222" },
      service: "Wedding hair",
      startAt: at(0, 14, 30),
      priceCents: 35000,
      depositCents: 5000,
      status: "confirmed",
      location: "The K Club, Kildare",
      messages: [{ label: "Booking confirmation sent", sentAt: at(-21, 9, 15) }],
    },
    {
      id: "booking-emma",
      client: { id: "client-emma", name: "Emma Lynch", phone: "+353852223333" },
      service: "Makeup",
      startAt: at(2, 11),
      priceCents: 12000,
      depositCents: 0,
      status: "enquiry",
      messages: [],
    },
    {
      id: "booking-ryan",
      client: { id: "client-ryan", name: "Ryan / Walsh", phone: "+353874445555" },
      service: "Wedding party",
      startAt: at(4, 8, 30),
      priceCents: 40000,
      depositCents: 10000,
      status: "confirmed",
      location: "Ballymagarvey Village",
      messages: [{ label: "Booking confirmation sent", sentAt: at(-42, 16, 40) }],
    },
    {
      id: "booking-niamh",
      client: { id: "client-niamh", name: "Niamh Byrne", phone: "+353899998888" },
      service: "Bridal makeup",
      startAt: at(-4, 9),
      priceCents: 22000,
      depositCents: 4000,
      status: "completed",
      messages: [
        { label: "Booking confirmation sent", sentAt: at(-38, 10, 20) },
        { label: "Payment request sent", sentAt: at(-4, 13, 5) },
      ],
    },
    {
      id: "booking-laura",
      client: { id: "client-laura", name: "Laura Murphy", phone: "+353833334444" },
      service: "Editorial makeup",
      startAt: at(-13, 12),
      priceCents: 18000,
      depositCents: 0,
      status: "completed",
      messages: [
        { label: "Booking confirmation sent", sentAt: at(-30, 11) },
        { label: "Payment request sent", sentAt: at(-13, 15, 10) },
      ],
    },
  ];

  return {
    bookings,
    payments: [
      {
        id: "payment-sarah-deposit",
        bookingId: "booking-sarah",
        kind: "deposit",
        amountCents: 2000,
        status: "paid",
        method: "bank_transfer",
        paidAt: at(-4, 12),
      },
      {
        id: "payment-obrien-deposit",
        bookingId: "booking-obrien",
        kind: "deposit",
        amountCents: 5000,
        status: "paid",
        method: "stripe",
        paidAt: at(-18, 10),
      },
      {
        id: "payment-ryan-deposit",
        bookingId: "booking-ryan",
        kind: "deposit",
        amountCents: 10000,
        status: "paid",
        method: "stripe",
        paidAt: at(-35, 16),
      },
      {
        id: "payment-niamh-balance",
        bookingId: "booking-niamh",
        kind: "balance",
        amountCents: 18000,
        status: "pending",
      },
      {
        id: "payment-niamh-deposit",
        bookingId: "booking-niamh",
        kind: "deposit",
        amountCents: 4000,
        status: "paid",
        method: "stripe",
        paidAt: at(-28, 14),
      },
      {
        id: "payment-laura-full",
        bookingId: "booking-laura",
        kind: "full",
        amountCents: 18000,
        status: "pending",
      },
    ],
    expenses: [
      {
        id: "expense-brown-thomas",
        merchant: "Brown Thomas",
        amountCents: 8640,
        category: "Materials",
        date: expenseDate(0, 2),
        hasReceipt: true,
      },
      {
        id: "expense-adobe",
        merchant: "Adobe",
        amountCents: 2460,
        category: "Software",
        date: expenseDate(0, 1),
        hasReceipt: false,
      },
      {
        id: "expense-circle-k",
        merchant: "Circle K",
        amountCents: 6820,
        category: "Travel",
        date: expenseDate(-1, 24),
        hasReceipt: true,
      },
      {
        id: "expense-mac",
        merchant: "MAC Cosmetics",
        amountCents: 13290,
        category: "Materials",
        date: expenseDate(-1, 16),
        hasReceipt: true,
      },
    ],
    business: {
      name: "Studio by Shane",
      owner: "Shane",
      phone: "+353871234567",
      reviewLink: "https://g.page/r/example/review",
    },
  };
}

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return seedData();
  try {
    return JSON.parse(saved) as StoreData;
  } catch {
    return seedData();
  }
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<StoreData>(loadData);

  const change = useCallback((updater: (current: StoreData) => StoreData) => {
    setData((current) => {
      const next = updater(current);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...data,
      addBooking(input) {
        const booking: Booking = {
          id: crypto.randomUUID(),
          client: {
            id: crypto.randomUUID(),
            name: input.clientName,
            phone: input.clientPhone,
          },
          service: input.service,
          startAt: input.startAt,
          priceCents: input.priceCents,
          depositCents: input.depositCents,
          status: "enquiry",
          location: input.location,
          notes: input.notes,
          messages: [],
        };
        change((current) => ({ ...current, bookings: [...current.bookings, booking] }));
        return booking;
      },
      confirmBooking(id) {
        change((current) => {
          const booking = current.bookings.find((item) => item.id === id);
          if (!booking) return current;
          const hasDeposit = current.payments.some(
            (payment) => payment.bookingId === id && payment.kind === "deposit",
          );
          return {
            ...current,
            bookings: current.bookings.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status: "confirmed",
                    messages: item.client.phone
                      ? [
                          ...item.messages,
                          { label: "Booking confirmation queued", sentAt: new Date().toISOString() },
                        ]
                      : item.messages,
                  }
                : item,
            ),
            payments:
              booking.depositCents > 0 && !hasDeposit
                ? [
                    ...current.payments,
                    {
                      id: crypto.randomUUID(),
                      bookingId: id,
                      kind: "deposit",
                      amountCents: booking.depositCents,
                      status: "pending",
                    },
                  ]
                : current.payments,
          };
        });
      },
      completeBooking(id) {
        change((current) => {
          const booking = current.bookings.find((item) => item.id === id);
          if (!booking) return current;
          const paid = current.payments
            .filter((payment) => payment.bookingId === id && payment.status === "paid")
            .reduce((sum, payment) => sum + payment.amountCents, 0);
          const remaining = Math.max(booking.priceCents - paid, 0);
          const settledPayments = current.payments.filter(
            (payment) =>
              payment.bookingId !== id || payment.status === "paid",
          );
          return {
            ...current,
            bookings: current.bookings.map((item) =>
              item.id === id ? { ...item, status: "completed" } : item,
            ),
            payments:
              remaining > 0
                ? [
                    ...settledPayments,
                    {
                      id: crypto.randomUUID(),
                      bookingId: id,
                      kind: paid > 0 ? "balance" : "full",
                      amountCents: remaining,
                      status: "pending",
                    },
                  ]
                : settledPayments,
          };
        });
      },
      cancelBooking(id) {
        change((current) => ({
          ...current,
          bookings: current.bookings.map((booking) =>
            booking.id === id ? { ...booking, status: "cancelled" } : booking,
          ),
          payments: current.payments.filter(
            (payment) => payment.bookingId !== id || payment.status === "paid",
          ),
        }));
      },
      markPaid(paymentId, method) {
        change((current) => ({
          ...current,
          payments: current.payments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: "paid", method, paidAt: new Date().toISOString() }
              : payment,
          ),
        }));
      },
      createPaymentLink(paymentId) {
        change((current) => ({
          ...current,
          bookings: current.bookings.map((booking) => {
            const payment = current.payments.find((item) => item.id === paymentId);
            if (!payment || booking.id !== payment.bookingId) return booking;
            return {
              ...booking,
              messages: [
                ...booking.messages,
                { label: "Payment link ready to send", sentAt: new Date().toISOString() },
              ],
            };
          }),
        }));
      },
      addExpense(expense) {
        change((current) => ({
          ...current,
          expenses: [{ ...expense, id: crypto.randomUUID() }, ...current.expenses],
        }));
      },
      updateBusiness(business) {
        change((current) => ({ ...current, business }));
      },
      resetDemo() {
        const seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        setData(seeded);
      },
    }),
    [change, data],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
