import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Icon, MoneyText, StatusChip } from "../components";
import { useStore } from "../lib/store";

function kindLabel(kind: "deposit" | "balance" | "full") {
  if (kind === "full") return "Full payment";
  return kind[0].toUpperCase() + kind.slice(1);
}

export function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookings,
    payments,
    confirmBooking,
    completeBooking,
    cancelBooking,
    markPaid,
    createPaymentLink,
  } = useStore();
  const booking = bookings.find((item) => item.id === id);

  if (!booking) {
    return (
      <div className="page">
        <Card className="empty-state">
          <strong>Booking not found</strong>
          <Link className="text-link" to="/">Back to today</Link>
        </Card>
      </div>
    );
  }

  const bookingPayments = payments.filter((payment) => payment.bookingId === booking.id);
  const paid = bookingPayments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amountCents, 0);

  return (
    <div className="page detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        <span>‹</span> Back
      </button>
      <div className="detail-hero">
        <div>
          <p className="eyebrow">{booking.client.name}</p>
          <h1>{booking.service}</h1>
        </div>
        <StatusChip status={booking.status} />
      </div>

      <Card className="detail-card">
        <div className="detail-line">
          <span className="detail-icon"><Icon name="calendar" /></span>
          <div>
            <strong>
              {new Intl.DateTimeFormat("en-IE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date(booking.startAt))}
            </strong>
            <span>
              {new Intl.DateTimeFormat("en-IE", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(booking.startAt))}
            </span>
          </div>
        </div>
        {booking.location && (
          <div className="detail-line">
            <span className="detail-icon"><Icon name="map" /></span>
            <div><strong>{booking.location}</strong><span>Location</span></div>
          </div>
        )}
        <div className="detail-line">
          <span className="detail-icon"><Icon name="user" /></span>
          <div>
            <strong>{booking.client.name}</strong>
            <span>{booking.client.phone || "No mobile added"}</span>
          </div>
        </div>
      </Card>

      {booking.notes && (
        <Card className="notes-card">
          <p className="eyebrow">Notes</p>
          <p>{booking.notes}</p>
        </Card>
      )}

      {booking.status === "enquiry" && (
        <div className="action-stack">
          <Button onClick={() => confirmBooking(booking.id)}>
            <Icon name="message" />
            {booking.client.phone
              ? `Confirm & notify ${booking.client.name.split(" ")[0]}`
              : "Confirm booking"}
          </Button>
          <Button kind="danger" onClick={() => cancelBooking(booking.id)}>Cancel enquiry</Button>
        </div>
      )}
      {booking.status === "confirmed" && (
        <div className="action-stack">
          <Button onClick={() => completeBooking(booking.id)}>
            <Icon name="check" /> Mark job complete
          </Button>
          <Button kind="danger" onClick={() => cancelBooking(booking.id)}>Cancel booking</Button>
        </div>
      )}

      <section className="detail-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">Money</p><h2>Payment</h2></div>
          <span className="paid-summary"><MoneyText cents={paid} /> of <MoneyText cents={booking.priceCents} /> paid</span>
        </div>
        <Card className="payment-card">
          <div className="price-total">
            <span>Total price</span>
            <MoneyText cents={booking.priceCents} />
          </div>
          {bookingPayments.length ? (
            bookingPayments.map((payment) => (
              <div className="payment-row" key={payment.id}>
                <div>
                  <strong>{kindLabel(payment.kind)}</strong>
                  <span>{payment.method?.replace("_", " ") || "Not paid yet"}</span>
                </div>
                <div className="payment-amount">
                  <MoneyText cents={payment.amountCents} />
                  <StatusChip status={payment.status} />
                </div>
                {payment.status === "pending" && (
                  <div className="inline-actions">
                    <Button kind="soft" onClick={() => createPaymentLink(payment.id)}>
                      Send link
                    </Button>
                    <Button kind="quiet" onClick={() => markPaid(payment.id, "bank_transfer")}>
                      Mark paid
                    </Button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-inline">
              {booking.status === "completed"
                ? "No payment is due."
                : "Payment is created when the booking is confirmed or completed."}
            </p>
          )}
        </Card>
      </section>

      <section className="detail-section">
        <div className="section-heading compact">
          <div><p className="eyebrow">Automations</p><h2>Client updates</h2></div>
        </div>
        <Card className="timeline-card">
          {booking.messages.length ? (
            booking.messages.map((message, index) => (
              <div className="timeline-row" key={`${message.sentAt}-${index}`}>
                <span className="timeline-check"><Icon name="check" size={14} /></span>
                <div>
                  <strong>{message.label}</strong>
                  <span>
                    {new Intl.DateTimeFormat("en-IE", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(message.sentAt))}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state small">
              <span className="empty-icon"><Icon name="message" /></span>
              <strong>No messages sent yet</strong>
              <p>Confirm the booking to start automatic client updates.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
