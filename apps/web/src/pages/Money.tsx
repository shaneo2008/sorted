import { Link } from "react-router-dom";
import { Button, Card, Icon, MoneyText, PageHeader } from "../components";
import { useStore } from "../lib/store";

export function Money() {
  const { bookings, payments, expenses, markPaid, createPaymentLink } = useStore();
  const pending = payments
    .filter((payment) => payment.status === "pending")
    .map((payment) => ({
      payment,
      booking: bookings.find((booking) => booking.id === payment.bookingId),
    }))
    .filter((item) => item.booking);
  const owed = pending.reduce((sum, item) => sum + item.payment.amountCents, 0);
  const income = payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amountCents, 0);
  const expenseTotal = expenses.reduce((sum, expense) => sum + expense.amountCents, 0);
  const currentYear = new Date().getFullYear();
  const monthly = Array.from({ length: 12 }, () => 0);
  for (const payment of payments) {
    if (payment.status !== "paid" || !payment.paidAt) continue;
    const paidAt = new Date(payment.paidAt);
    if (paidAt.getFullYear() === currentYear) {
      monthly[paidAt.getMonth()] += payment.amountCents;
    }
  }
  const maxMonth = Math.max(...monthly, 1);

  function exportCsv() {
    const incomeRows = payments
      .filter((payment) => payment.status === "paid")
      .map((payment) => {
        const booking = bookings.find((item) => item.id === payment.bookingId);
        return [
          payment.paidAt?.slice(0, 10) || "",
          booking?.client.name || "",
          booking?.service || "",
          payment.kind,
          payment.method || "",
          (payment.amountCents / 100).toFixed(2),
        ];
      });
    const expenseRows = expenses.map((expense) => [
      expense.date.slice(0, 10),
      expense.merchant,
      expense.category,
      (expense.amountCents / 100).toFixed(2),
      expense.hasReceipt ? "yes" : "no",
    ]);
    const csv = [
      ["INCOME"],
      ["date_paid", "client", "service", "kind", "method", "amount_eur"],
      ...incomeRows,
      [],
      ["EXPENSES"],
      ["date", "merchant", "category", "amount_eur", "has_receipt"],
      ...expenseRows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `sorted-${new Date().getFullYear()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Money" title="Know where you stand." />
      <Card className="money-hero-card">
        <div className="money-hero-top">
          <span>Owed to you</span>
          <span className="live-pill"><i /> Live</span>
        </div>
        <MoneyText cents={owed} className="money-hero" />
        <p>Across {pending.length} {pending.length === 1 ? "payment" : "payments"}</p>
      </Card>

      <section className="list-section">
        <div className="section-heading">
          <div><p className="eyebrow">To collect</p><h2>Outstanding</h2></div>
        </div>
        {pending.length ? (
          <div className="owed-list">
            {pending.map(({ payment, booking }) => (
              <Card className="owed-card" key={payment.id}>
                <Link to={`/bookings/${booking!.id}`} className="owed-main">
                  <span className="client-initial">{booking!.client.name[0]}</span>
                  <div>
                    <strong>{booking!.client.name}</strong>
                    <span>{booking!.service} · {payment.kind}</span>
                  </div>
                  <MoneyText cents={payment.amountCents} />
                </Link>
                <div className="owed-actions">
                  <Button kind="soft" onClick={() => createPaymentLink(payment.id)}>
                    <Icon name="message" size={17} /> Send link
                  </Button>
                  <Button kind="quiet" onClick={() => markPaid(payment.id, "bank_transfer")}>
                    <Icon name="check" size={17} /> Mark paid
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="empty-state">
            <span className="empty-icon paid"><Icon name="check" /></span>
            <strong>Nobody owes you anything. Lovely.</strong>
          </Card>
        )}
      </section>

      <section className="list-section">
        <div className="section-heading">
          <div><p className="eyebrow">This year</p><h2>The big picture</h2></div>
        </div>
        <Card className="year-card">
          <div className="year-stats">
            <div><span>Income</span><MoneyText cents={income} /></div>
            <div><span>Expenses</span><MoneyText cents={expenseTotal} /></div>
            <div className="profit-stat">
              <span>Profit</span><MoneyText cents={income - expenseTotal} />
            </div>
          </div>
          <div className="bar-chart" aria-label="Monthly income chart">
            {monthly.map((height, index) => (
              <span
                key={index}
                style={{ height: `${Math.max((height / maxMonth) * 100, 3)}%` }}
              />
            ))}
          </div>
          <div className="chart-labels"><span>Jan</span><span>Jun</span><span>Dec</span></div>
          <Button kind="soft" className="export-button" onClick={exportCsv}>
            <Icon name="download" /> Export for accountant
          </Button>
        </Card>
      </section>
    </div>
  );
}
