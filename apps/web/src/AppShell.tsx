import { Outlet, NavLink } from "react-router-dom";
import { Icon } from "./components";

export function AppShell() {
  return (
    <div className="shell">
      <main className="content">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main navigation">
        <NavLink to="/" end>
          <Icon name="calendar" />
          <span>Today</span>
        </NavLink>
        <NavLink to="/bookings/new" className="fab" aria-label="Add booking">
          <Icon name="plus" size={28} />
        </NavLink>
        <NavLink to="/money">
          <Icon name="wallet" />
          <span>Money</span>
        </NavLink>
        <NavLink to="/expenses">
          <Icon name="receipt" />
          <span>Expenses</span>
        </NavLink>
      </nav>
    </div>
  );
}
