import { Outlet, NavLink } from "react-router-dom";

/**
 * Mobile-first shell: content + bottom tab bar + a big centre "+" that goes
 * straight to Add Booking — the whole product is that button being fast.
 * TODO(M1): auth gate — redirect to /login when no JWT in storage.
 */
export function AppShell() {
  return (
    <div className="shell">
      <main className="content">
        <Outlet />
      </main>
      <nav className="tabbar">
        <NavLink to="/" end>Today</NavLink>
        <NavLink to="/bookings/new" className="fab" aria-label="Add booking">＋</NavLink>
        <NavLink to="/money">Money</NavLink>
        <NavLink to="/expenses">Expenses</NavLink>
      </nav>
    </div>
  );
}
