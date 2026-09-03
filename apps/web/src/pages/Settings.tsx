import { useState, type FormEvent } from "react";
import { Button, Card, Field, Icon, PageHeader } from "../components";
import { useStore } from "../lib/store";

export function Settings() {
  const { business, updateBusiness, resetDemo } = useStore();
  const [form, setForm] = useState(business);
  const [saved, setSaved] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    updateBusiness(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Settings" title="Your business" />
      <p className="page-intro">The details clients see in messages and calendar invites.</p>
      <form onSubmit={submit}>
        <Card className="form-card settings-card">
          <Field label="Business name">
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Your name">
            <input
              required
              value={form.owner}
              onChange={(event) => setForm({ ...form, owner: event.target.value })}
            />
          </Field>
          <Field label="Mobile">
            <input
              required
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </Field>
          <Field label="Google review link" helper="Sent automatically two days after a completed job.">
            <input
              value={form.reviewLink}
              onChange={(event) => setForm({ ...form, reviewLink: event.target.value })}
              placeholder="https://g.page/..."
            />
          </Field>
          <Field label="Currency">
            <div className="locked-field">EUR · Euro <span>Locked for beta</span></div>
          </Field>
        </Card>
        <Button type="submit">
          <Icon name="check" /> {saved ? "Saved" : "Save settings"}
        </Button>
      </form>

      <section className="settings-section">
        <p className="eyebrow">Connections</p>
        <Card className="connection-card">
          <div className="connection-row">
            <span className="connection-logo calendar-logo">G</span>
            <div><strong>Google Calendar</strong><span>Bookings stay in sync</span></div>
            <button>Connect</button>
          </div>
          <div className="connection-row">
            <span className="connection-logo whatsapp-logo">W</span>
            <div><strong>WhatsApp</strong><span>Client messages and reminders</span></div>
            <span className="coming-pill">Coming soon</span>
          </div>
        </Card>
      </section>

      <Button kind="quiet" onClick={resetDemo}>Reset demo data</Button>
      <p className="settings-footnote">Sorted beta · Made for Irish sole traders</p>
    </div>
  );
}
