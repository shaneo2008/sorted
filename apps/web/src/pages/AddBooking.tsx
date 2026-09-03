/**
 * TODO(M1): THE core screen. One scrollable form, huge Save button:
 *   - Client: search-as-you-type against GET /clients?q=; "New client" inline
 *     expands name+phone fields (phone optional, but nudge: "add a mobile so
 *     Sorted can send confirmations")
 *   - Service (text), Date+time, Price (€, convert to cents), Deposit (€,
 *     optional), Location (optional)
 *   - Save → POST /bookings → then a second screen: "Confirm booking now?"
 *     → POST /bookings/:id/confirm (this is what fires WhatsApp + calendar)
 * Target: sub-30-seconds on a phone with a new client. Count taps.
 */
export function AddBooking() {
  return (
    <div>
      <h1>Add booking</h1>
      <p className="muted">Not implemented — see TODO(M1) in this file.</p>
    </div>
  );
}
