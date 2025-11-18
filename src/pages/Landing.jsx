import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="landing-root">
      <div className="landing-hero">
        <h1 className="landing-title">Strategy Analyzer</h1>
        <p className="landing-subtitle">
          Backtest your trading ideas with real market data. Stop guessing — validate
          your edge and trade with confidence.
        </p>
        <p className="landing-tagline">
          Build confidence through proof, not hope.
        </p>
        <Link to="/app/test" className="primary-btn">
          Start Testing Strategy
        </Link>
      </div>
    </div>
  );
}
