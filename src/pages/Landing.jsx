import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="app-landing">
      <div className="hero-inner">
        <h1 className="hero-title">Strategy Analyzer</h1>
        <p className="hero-subtitle">
          Build confidence through proof, not hope.
        </p>
        <Link to="/app" className="hero-cta">
          Test Your Strategy
        </Link>
        <p className="hero-note">
          No hype. No illusions. Just data. The engine comes next.
        </p>

        <section className="section">
          <h2 className="section-title">What it does</h2>
          <div className="section-text">
            <p>Expose weak strategies before they drain your account.</p>
            <p>See if your edge exists outside your imagination.</p>
            <p>Trade with facts, not feelings.</p>
          </div>
        </section>
      </div>
    </div>
  );
}