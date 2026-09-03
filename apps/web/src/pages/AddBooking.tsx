import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Field, Icon, MoneyText, PageHeader } from "../components";
import { useStore, type Booking } from "../lib/store";

function defaultDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function AddBooking() {
  const { bookings, addBooking, confirmBooking } = useStore();
  const navigate = useNavigate();
  const [saved, setSaved] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    date: defaultDate(),
    time: "10:00",
    price: "",
    deposit: "",
    location: "",
    notes: "",
  });
  const services = useMemo(
    () => [...new Set(bookings.map((booking) => booking.service))].slice(0, 4),
    [bookings],
  );

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const priceCents = Math.round(Number(form.price) * 100);
    const depositCents = Math.round(Number(form.deposit || 0) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setError("Add a valid price.");
      return;
    }
    if (!Number.isFinite(depositCents) || depositCents < 0 || depositCents > priceCents) {
      setError("The deposit can’t be more than the total price.");
      return;
    }
    setError("");
    const booking = addBooking({
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim() || undefined,
      service: form.service.trim(),
      startAt: new Date(`${form.date}T${form.time}`).toISOString(),
      priceCents,
      depositCents,
      location: form.location.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
    setSaved(booking);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (saved) {
    return (
      <div className="page success-page">
        <div className="success-mark"><Icon name="check" size={32} /></div>
        <p className="eyebrow">Nicely done</p>
        <h1>Booking saved.</h1>
        <p className="success-copy">
          {saved.client.name} · {saved.service}
        </p>
        <Card className="saved-summary">
          <div>
            <Icon name="calendar" />
            <span>
              {new Intl.DateTimeFormat("en-IE", {
                weekday: "long",
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(saved.startAt))}
            </span>
          </div>
          <div>
            <Icon name="wallet" />
            <MoneyText cents={saved.priceCents} />
          </div>
        </Card>
        <Button
          onClick={() => {
            confirmBooking(saved.id);
            navigate(`/bookings/${saved.id}`);
          }}
        >
          <Icon name="message" />
          {saved.client.phone ? `Confirm & notify ${saved.client.name.split(" ")[0]}` : "Confirm booking"}
        </Button>
        {!saved.client.phone && (
          <p className="button-caption">No mobile on file — no message will be sent.</p>
        )}
        <Link className="text-link" to={`/bookings/${saved.id}`}>Keep as enquiry</Link>
      </div>
    );
  }

  return (
    <div className="page form-page">
      <PageHeader eyebrow="New booking" title="Who are you seeing?" />
      <p className="page-intro">One quick form. We’ll handle the rest.</p>
      <form onSubmit={submit}>
        <Card className="form-card">
          <Field label="Client name">
            <div className="input-with-icon">
              <Icon name="user" />
              <input
                required
                autoFocus
                value={form.clientName}
                onChange={(event) => update("clientName", event.target.value)}
                placeholder="e.g. Sarah Keane"
                autoComplete="name"
              />
            </div>
          </Field>
          <Field
            label="Mobile"
            helper="Add a mobile so Sorted can send confirmations for you."
          >
            <div className="phone-input">
              <span>+353</span>
              <input
                inputMode="tel"
                value={form.clientPhone.replace(/^\+353/, "")}
                onChange={(event) =>
                  update("clientPhone", event.target.value ? `+353${event.target.value.replace(/\D/g, "")}` : "")
                }
                placeholder="87 123 4567"
                autoComplete="tel"
              />
            </div>
          </Field>
        </Card>

        <Card className="form-card">
          <Field label="Service">
            <input
              required
              value={form.service}
              onChange={(event) => update("service", event.target.value)}
              placeholder="e.g. Bridal makeup"
            />
          </Field>
          <div className="suggestion-row">
            {services.map((service) => (
              <button type="button" key={service} onClick={() => update("service", service)}>
                {service}
              </button>
            ))}
          </div>
          <div className="field-grid">
            <Field label="Date">
              <input
                required
                type="date"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
              />
            </Field>
            <Field label="Time">
              <input
                required
                type="time"
                value={form.time}
                onChange={(event) => update("time", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Price">
            <div className="money-input">
              <span>€</span>
              <input
                required
                inputMode="decimal"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                placeholder="0.00"
              />
            </div>
          </Field>

          {!showDeposit ? (
            <button type="button" className="reveal-button" onClick={() => setShowDeposit(true)}>
              <Icon name="plus" size={17} /> Add deposit
            </button>
          ) : (
            <Field label="Deposit">
              <div className="money-input">
                <span>€</span>
                <input
                  inputMode="decimal"
                  value={form.deposit}
                  onChange={(event) => update("deposit", event.target.value)}
                  placeholder="0.00"
                />
              </div>
            </Field>
          )}

          {!showMore ? (
            <button type="button" className="reveal-button" onClick={() => setShowMore(true)}>
              <Icon name="plus" size={17} /> Location or notes
            </button>
          ) : (
            <>
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(event) => update("location", event.target.value)}
                  placeholder="Studio, venue or address"
                />
              </Field>
              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  placeholder="Anything useful to remember"
                  rows={3}
                />
              </Field>
            </>
          )}
        </Card>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="sticky-action">
          <Button type="submit">
            Save booking <Icon name="arrow" />
          </Button>
        </div>
      </form>
    </div>
  );
}
