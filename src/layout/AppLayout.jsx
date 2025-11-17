import { Link, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import TestStrategy from "../pages/TestStrategy";
import Results from "../pages/Results";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-dot" />
          <span>Strategy Analyzer</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/app/dashboard" className="sidebar-link">
            Dashboard
          </Link>
          <Link to="/app/test" className="sidebar-link">
            Test Strategy
          </Link>
          <Link to="/app/results" className="sidebar-link">
            Results
          </Link>
        </nav>
      </aside>

      <main className="main-area">
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="test" element={<TestStrategy />} />
          <Route path="results" element={<Results />} />
        </Routes>
      </main>
    </div>
  );
}
