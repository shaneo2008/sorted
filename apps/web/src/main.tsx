import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "./AppShell";
import { Home } from "./pages/Home";
import { AddBooking } from "./pages/AddBooking";
import { Money } from "./pages/Money";
import { Expenses } from "./pages/Expenses";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/bookings/new" element={<AddBooking />} />
          <Route path="/money" element={<Money />} />
          <Route path="/expenses" element={<Expenses />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
