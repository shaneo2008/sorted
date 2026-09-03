/**
 * TODO(M5): camera-first flow.
 *   Big "Snap receipt" button → <input type="file" accept="image/*"
 *   capture="environment"> → POST /expenses/upload-url → PUT to S3 →
 *   POST /expenses → confirm screen showing the photo + 4 editable fields
 *   (merchant, amount, date, category) pre-filled from OCR → Confirm.
 *   Below: list of this year's expenses with category chips.
 */
export function Expenses() {
  return (
    <div>
      <h1>Expenses</h1>
      <p className="muted">Not implemented — see TODO(M5).</p>
    </div>
  );
}
