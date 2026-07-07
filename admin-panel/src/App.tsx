import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";

import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { UsersPage } from "./pages/UsersPage";
import MatchesPage from "./pages/MatchesPage";
import SubscriptionsPage from "./pages/SubscriptionsPage";
import UserDetailPage from "./pages/UserDetailPage";
import GiftCatalogPage from "./pages/GiftCatalogPage";
import GiftOrdersPage from "./pages/GiftOrdersPage";
import VenuesPage from "./pages/VenuesPage";
import { clearTokens, isAuthenticated } from "./services/api";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/users", label: "Kullanıcılar" },
  { to: "/matches", label: "Eşlemeler" },
  { to: "/subscriptions", label: "Abonelikler" },
  { to: "/gift-catalog", label: "Hediye Kataloğu" },
  { to: "/gift-orders", label: "Hediye Siparişleri" },
  { to: "/venues", label: "Mekanlar" },
  { to: "/reports", label: "Raporlar" },
];

export function App() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [demoMode, setDemoMode] = useState(false);

  if (!authed && !demoMode) {
    return (
      <div>
        <LoginPage onSuccess={() => setAuthed(true)} />
        <p className="demo-link">
          <button className="btn-link" onClick={() => setDemoMode(true)}>
            Backend olmadan demo görünümüne geç →
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">TwinMatch</p>
          <h1>Admin Panel</h1>
          <p className="muted">{authed ? "Canlı oturum" : "Demo görünüm"}</p>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          className="btn-secondary logout-btn"
          onClick={() => {
            clearTokens();
            setAuthed(false);
            setDemoMode(false);
          }}
        >
          Çıkış yap
        </button>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/:id" element={<UserDetailPage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/gift-catalog" element={<GiftCatalogPage />} />
          <Route path="/gift-orders" element={<GiftOrdersPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </main>
    </div>
  );
}
