import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="page" style={{ display:"flex", justifyContent:"center" }}>
      <div className="form-card" style={{ textAlign:"center", maxWidth:"600px" }}>
        <h1 style={{ fontSize:"2rem", fontWeight:"700" }}>
          Strategy Analyzer
        </h1>

        <p style={{ opacity:.65, marginTop:"1rem" }}>
          Backtest your trading ideas with real market data. Stop guessing — 
          validate your edge and trade with confidence.
        </p>

        <Link to="/test">
          <button className="btn-primary" style={{ marginTop:"2rem", width:"100%" }}>
            🚀 Start Testing Strategy
          </button>
        </Link>
      </div>
    </div>
  );
}
