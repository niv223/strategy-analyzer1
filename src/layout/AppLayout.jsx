import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo-block">
          <div className="logo-dot" />
          <div>
            <div className="logo-title">Strategy Analyzer</div>
            <div className="logo-sub">Build confidence through proof.</div>
          </div>
        </div>

        <nav className="nav-links">
          <Link
            to="/app/dashboard"
            className={isActive("/app/dashboard") ? "nav-link active" : "nav-link"}
          >
            Dashboard
          </Link>
          <Link
            to="/app/test"
            className={isActive("/app/test") ? "nav-link active" : "nav-link"}
          >
            Test Strategy
          </Link>
          <Link
            to="/app/results"
            className={isActive("/app/results") ? "nav-link active" : "nav-link"}
          >
            Results
          </Link>
        </nav>
      </aside>

      <main className="main-panel">
        <Outlet />
      </main>
    </div>
  );
}
