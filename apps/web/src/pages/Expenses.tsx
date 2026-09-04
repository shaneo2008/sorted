import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button, Card, Field, Icon, MoneyText, PageHeader } from "../components";
import { useStore, type ExpenseCategory } from "../lib/store";

const categories: ExpenseCategory[] = [
  "Materials",
  "Travel",
  "Equipment",
  "Software",
  "Phone & internet",
  "Insurance",
  "Training",
  "Marketing",
  "Other",
];

export function Expenses() {
  const { expenses, addExpense } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    merchant: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    category: "Materials" as ExpenseCategory,
  });
  const total = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);

  function picked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setShowForm(true);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const amountCents = Math.round(Number(form.amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setError("Add a valid expense amount.");
      return;
    }
    addExpense({
      merchant: form.merchant.trim(),
      amountCents,
      category: form.category,
      date: new Date(`${form.date}T12:00:00`).toISOString(),
      hasReceipt: Boolean(preview),
    });
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setShowForm(false);
    setError("");
    if (fileInput.current) fileInput.current.value = "";
    setForm({
      merchant: "",
      amount: "",
      date: new Date().toISOString().slice(0, 10),
      category: "Materials",
    });
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Expenses"
        title="Keep every write-off."
        action={<span className="year-total"><small>This year</small><MoneyText cents={total} /></span>}
      />

      {!showForm ? (
        <button className="receipt-capture" onClick={() => fileInput.current?.click()}>
          <span className="camera-orb"><Icon name="camera" size={28} /></span>
          <span><strong>Snap a receipt</strong><small>We’ll help sort the details</small></span>
          <Icon name="arrow" />
        </button>
      ) : (
        <Card className="receipt-form-card">
          <div className="receipt-preview">
            {preview && <img src={preview} alt="Receipt preview" />}
            <span><Icon name="sparkles" /> Ready to review</span>
          </div>
          <form onSubmit={submit}>
            <p className="eyebrow">Confirm the details</p>
            <Field label="Merchant">
              <input
                autoFocus
                required
                value={form.merchant}
                onChange={(event) => setForm({ ...form, merchant: event.target.value })}
                placeholder="Where did you buy it?"
              />
            </Field>
            <div className="field-grid">
              <Field label="Amount">
                <div className="money-input">
                  <span>€</span>
                  <input
                    required
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <Field label="Date">
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
              </Field>
            </div>
            <span className="field-label category-label">Category</span>
            <div className="category-row">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={form.category === category ? "active" : ""}
                  onClick={() => setForm({ ...form, category })}
                >
                  {category}
                </button>
              ))}
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button type="submit"><Icon name="check" /> Confirm expense</Button>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview);
                setPreview(null);
                setShowForm(false);
                setError("");
                if (fileInput.current) fileInput.current.value = "";
              }}
            >
              Discard
            </button>
          </form>
        </Card>
      )}
      <input
        ref={fileInput}
        className="visually-hidden"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={picked}
      />

      <section className="list-section">
        <div className="section-heading">
          <div><p className="eyebrow">Recent</p><h2>Your expenses</h2></div>
          <button className="filter-button">All categories</button>
        </div>
        <Card className="expense-list">
          {expenses.map((expense, index) => {
            const previous = expenses[index - 1];
            const month = new Intl.DateTimeFormat("en-IE", { month: "long" }).format(new Date(expense.date));
            const previousMonth = previous
              ? new Intl.DateTimeFormat("en-IE", { month: "long" }).format(new Date(previous.date))
              : null;
            return (
              <div key={expense.id}>
                {month !== previousMonth && <p className="date-divider">{month}</p>}
                <div className="expense-row">
                  <span className="expense-icon"><Icon name="receipt" /></span>
                  <div>
                    <strong>{expense.merchant}</strong>
                    <span>{expense.category} · {new Date(expense.date).getDate()} {month.slice(0, 3)}</span>
                  </div>
                  <MoneyText cents={expense.amountCents} />
                </div>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
