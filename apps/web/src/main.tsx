import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Home } from "./pages/Home";
import { AddBooking } from "./pages/AddBooking";
import { Money } from "./pages/Money";
import { Expenses } from "./pages/Expenses";
import { BookingDetail } from "./pages/BookingDetail";
import { Settings } from "./pages/Settings";
import { Login } from "./pages/Login";
import { StoreProvider } from "./lib/store";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/bookings/new" element={<AddBooking />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/money" element={<Money />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  </React.StrictMode>,
);
