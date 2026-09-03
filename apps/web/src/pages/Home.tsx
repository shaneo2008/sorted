import { Link } from "react-router-dom";
import { Card, Icon, MoneyText, StatusChip } from "../components";
import { useStore, type Booking } from "../lib/store";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

function dateLabel(value: string) {
  const date = new Date(value);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(date, today)) return "Today";
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return new Intl.DateTimeFormat("en-IE", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
}

function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link className="booking-row" to={`/bookings/${booking.id}`}>
      <time>
        {new Intl.DateTimeFormat("en-IE", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(booking.startAt))}
      </time>
      <div className="booking-row-main">
        <strong>{booking.client.name}</strong>
        <span>{booking.service}</span>
      </div>
      <div className="booking-row-trailing">
        <MoneyText cents={booking.priceCents} />
        <StatusChip status={booking.status} />
      </div>
      <Icon name="chevron" size={17} />
    </Link>
  );
}

export function Home() {
  const { bookings, payments, business } = useStore();
  const activeBookings = bookings
    .filter((booking) => booking.status !== "cancelled")
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const today = activeBookings.filter((booking) => sameDay(new Date(booking.startAt), new Date()));
  const upcoming = activeBookings.filter((booking) => new Date(booking.startAt) > new Date() && !today.includes(booking));
  const owed = payments
    .filter((payment) => payment.status === "pending")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="page">
      <header className="brand-header">
        <div>
          <p className="brand-wordmark">Sorted<span>.</span></p>
          <p className="header-greeting">{greeting}, {business.owner}</p>
        </div>
        <Link className="icon-button avatar-button" to="/settings" aria-label="Settings">
          {business.owner.slice(0, 1).toUpperCase()}
        </Link>
      </header>

      <Card className="snapshot-card">
        <div>
          <span className="snapshot-label">Coming up</span>
          <strong>{today.length} {today.length === 1 ? "booking" : "bookings"} today</strong>
        </div>
        <div className="snapshot-divider" />
        <Link to="/money">
          <span className="snapshot-label">Owed to you</span>
          <MoneyText cents={owed} />
          <Icon name="arrow" size={16} />
        </Link>
      </Card>

      <section className="list-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Today</p>
            <h2>
              {new Intl.DateTimeFormat("en-IE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).format(new Date())}
            </h2>
          </div>
          <span className="count-badge">{today.length}</span>
        </div>
        <Card className="list-card">
          {today.length ? (
            today.map((booking) => <BookingRow key={booking.id} booking={booking} />)
          ) : (
            <div className="empty-state">
              <span className="empty-icon"><Icon name="calendar" /></span>
              <strong>Your day is clear</strong>
              <p>Tap + to log a booking. It takes about 30 seconds.</p>
            </div>
          )}
        </Card>
      </section>

      <section className="list-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Next up</p>
            <h2>Upcoming bookings</h2>
          </div>
        </div>
        <Card className="list-card">
          {upcoming.length ? (
            upcoming.slice(0, 5).map((booking, index) => {
              const previous = upcoming[index - 1];
              const showDate = !previous || !sameDay(new Date(previous.startAt), new Date(booking.startAt));
              return (
                <div key={booking.id}>
                  {showDate && <p className="date-divider">{dateLabel(booking.startAt)}</p>}
                  <BookingRow booking={booking} />
                </div>
              );
            })
          ) : (
            <div className="empty-state small">
              <span className="empty-icon"><Icon name="calendar" /></span>
              <strong>Nothing else booked yet</strong>
              <p>Your next confirmed booking will appear here.</p>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
