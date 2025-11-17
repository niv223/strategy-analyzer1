import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="hero">
      <div className="hero-bg" />

      <div className="hero-content">
        <div className="hero-pill">Backtest • Validate • Refine</div>

        <h1 className="hero-title">
          Strategy Analyzer
        </h1>

        <p className="hero-subtitle">
          Build confidence through proof, not hope.  
          Backtest your trading ideas on real market data and stop guessing your edge.
        </p>

        <Link to="/app/test">
          <button className="hero-button">
            Start testing your strategy
          </button>
        </Link>

        <p className="hero-caption">
          No fluff. No indicators circus. Just data, performance and discipline.
        </p>
      </div>
    </div>
  );
}
