import { Link, Outlet, useLocation } from "react-router-dom";

export default function AppLayout() {
  const { pathname } = useLocation();

  const isActive = (target) => {
    if (target === "/app") return pathname === "/app";
    return pathname.startsWith(target);
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2 className="logo">Strategy Analyzer</h2>
        <nav className="nav">
          <Link className={isActive("/app") ? "active" : ""} to="/app">
            Dashboard
          </Link>
          <Link className={isActive("/app/test") ? "active" : ""} to="/app/test">
            Test Strategy
          </Link>
          <Link className={isActive("/app/results") ? "active" : ""} to="/app/results">
            Results
          </Link>
        </nav>
      </aside>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}