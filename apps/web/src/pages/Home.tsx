import { useEffect, useState } from "react";
import { api } from "../lib/api";

/**
 * The home screen: Today + Upcoming bookings.
 * TODO(M1): replace health check with GET /bookings?from=today, grouped by
 * day, each row = time · client · service · status chip. Tap → detail page
 * (add /bookings/:id route). Empty state: "No bookings yet — tap + to add
 * your first."
 */
export function Home() {
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ ok: boolean }>("/health")
      .then((r) => setApiOk(r.ok))
      .catch(() => setApiOk(false));
  }, []);

  return (
    <div>
      <h1>Today</h1>
      <p className="muted">
        {apiOk === null && "Checking API…"}
        {apiOk === true && "✅ API connected — M0 complete. See docs/IMPLEMENTATION_PLAN.md"}
        {apiOk === false && "❌ API not reachable. Is `pnpm --filter api dev` running?"}
      </p>
    </div>
  );
}
