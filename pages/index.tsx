import { useState } from "react";
import type { BacktestResponse } from "../lib/types";

type ViewState = "idle" | "loading" | "error" | "done";

export default function HomePage() {
  const [entered, setEntered] = useState(false);
  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("1h");
  const [candles, setCandles] = useState(300);
  const [strategyText, setStrategyText] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResponse | null>(null);

  const handleRunBacktest = async () => {
    setError(null);

    if (!symbol.trim() || !timeframe.trim() || !strategyText.trim()) {
      setError("Fill all fields first");
      setState("error");
      return;
    }

    setState("loading");
    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim(),
          timeframe: timeframe.trim(),
          candles,
          strategyText: strategyText.trim()
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const message = data?.error || `Request failed: ${res.status}`;
        throw new Error(message);
      }

      const data = (await res.json()) as BacktestResponse;
      setResult(data);
      setState("done");
    } catch (err: any) {
      console.error(err);
      setError(String(err.message || err));
      setState("error");
    }
  };

  const hasResult = !!result;

  return (
    <div className={entered ? "sa-root sa-entered" : "sa-root"}>
      {/* HERO / INTRO */}
      <section className="sa-hero">
        <div className="sa-hero-inner">
          <div className="sa-logo-pill">SA</div>
          <h1 className="sa-hero-title">Strategy Analyzer</h1>
          <p className="sa-hero-subtitle">
            Turn your day trading ideas into instant AI powered backtests.
          </p>
          <p className="sa-hero-text">
            Describe your strategy in plain language, choose a symbol and
            timeframe, and let the engine simulate trades, stats and an equity
            curve for you.
          </p>

          <button
            className="sa-hero-button"
            onClick={() => setEntered(true)}
          >
            Enter app
          </button>

          <div className="sa-hero-footnote">
            No signup. No noise. Just fast backtesting for serious traders.
          </div>
        </div>
      </section>

      {/* APP SHELL */}
      <main className="sa-app">
        <header className="sa-app-header">
          <div className="sa-app-brand">
            <div className="sa-logo-pill sa-logo-small">SA</div>
            <div>
              <div className="sa-app-title">Strategy Analyzer</div>
              <div className="sa-app-subtitle">
                Live backtest workspace
              </div>
            </div>
          </div>

          <div className="sa-app-badge">Alpha build</div>
        </header>

        <section className="sa-app-grid">
          {/* LEFT – FORM */}
          <div className="sa-card sa-form-card">
            <h2 className="sa-section-title">Setup</h2>

            <div className="sa-form-grid">
              <div className="sa-field">
                <label className="sa-label">Symbol</label>
                <input
                  className="sa-input"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="EURUSD, XAUUSD, NAS100..."
                />
              </div>

              <div className="sa-field">
                <label className="sa-label">Timeframe</label>
                <input
                  className="sa-input"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  placeholder="1h, 15min, 5min..."
                />
              </div>

              <div className="sa-field">
                <label className="sa-label">Candles</label>
                <input
                  type="number"
                  min={50}
                  max={1500}
                  className="sa-input"
                  value={candles}
                  onChange={(e) => setCandles(Number(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="sa-field sa-field-textarea">
              <label className="sa-label">Strategy description</label>
              <textarea
                className="sa-textarea"
                value={strategyText}
                onChange={(e) => setStrategyText(e.target.value)}
                placeholder={`Example:
- Daily bias from HTF
- Enter after liquidity sweep + MSS
- Use FVG for entry
- 1% risk per trade, 2.5R target
- Skip high–impact news`}
              />
            </div>

            <button
              className={
                state === "loading"
                  ? "sa-primary-button sa-primary-button-disabled"
                  : "sa-primary-button"
              }
              onClick={handleRunBacktest}
              disabled={state === "loading"}
            >
              {state === "loading" ? "Running backtest..." : "Run backtest"}
            </button>

            {state === "error" && error && (
              <p className="sa-error-text">{error}</p>
            )}

            {state === "done" && !error && (
              <p className="sa-success-text">
                Backtest complete. Scroll the stats and trades on the right.
              </p>
            )}
          </div>

          {/* RIGHT – DASHBOARD */}
          <div className="sa-right-column">
            <div className="sa-card sa-stats-card">
              <h2 className="sa-section-title">Stats</h2>

              {hasResult ? (
                <div className="sa-stats-grid">
                  <StatPill
                    label="Winrate"
                    value={`${(result!.stats.winrate * 100).toFixed(1)}%`}
                  />
                  <StatPill
                    label="Average RR"
                    value={result!.stats.rr.toFixed(2)}
                  />
                  <StatPill
                    label="Profit factor"
                    value={result!.stats.profitFactor.toFixed(2)}
                  />
                  <StatPill
                    label="Max drawdown (R)"
                    value={result!.stats.maxDrawdown.toFixed(2)}
                  />
                </div>
              ) : (
                <p className="sa-placeholder">
                  Run a backtest to see winrate, RR, profit factor and
                  drawdown.
                </p>
              )}
            </div>

            <div className="sa-bottom-row">
              <div className="sa-card sa-equity-card">
                <h3 className="sa-subtitle">Equity curve (R)</h3>
                {hasResult && result!.equityCurve.length > 1 ? (
                  <EquityCurveMini points={result!.equityCurve} />
                ) : (
                  <p className="sa-placeholder-small">
                    Equity curve will appear here once you have trades.
                  </p>
                )}
              </div>

              <div className="sa-card sa-trades-card">
                <h3 className="sa-subtitle">Recent trades</h3>
                {hasResult && result!.trades.length > 0 ? (
                  <TradesMini trades={result!.trades.slice(0, 7)} />
                ) : (
                  <p className="sa-placeholder-small">
                    No trades yet. Run a backtest to see a summary.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* GLOBAL + COMPONENT STYLES */}
      <style jsx global>{`
        :root {
          color-scheme: light;
        }

        body {
          margin: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          background: radial-gradient(circle at top, #f5f5f7 0, #e5e7eb 45%, #d4d4d8 100%);
          color: #0f172a;
        }

        * {
          box-sizing: border-box;
        }

        .sa-root {
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 32px 16px 40px;
          transition: background 0.6s ease-out;
        }

        .sa-hero,
        .sa-app {
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
        }

        /* HERO */

        .sa-hero {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .sa-hero-inner {
          background: rgba(255, 255, 255, 0.82);
          border-radius: 32px;
          padding: 40px 40px 36px;
          box-shadow: 0 26px 80px rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(26px);
          text-align: center;
          max-width: 720px;
          position: relative;
          overflow: hidden;
        }

        .sa-hero-inner::before {
          content: "";
          position: absolute;
          inset: -30%;
          background: radial-gradient(
              circle at 0 0,
              rgba(59, 130, 246, 0.12),
              transparent 60%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(52, 211, 153, 0.12),
              transparent 60%
            );
          opacity: 0.9;
          pointer-events: none;
        }

        .sa-hero-inner > * {
          position: relative;
          z-index: 1;
        }

        .sa-logo-pill {
          width: 52px;
          height: 52px;
          border-radius: 999px;
          background: radial-gradient(circle at 30% 0, #0ea5e9 0, #1d4ed8 40%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #f9fafb;
          font-weight: 700;
          font-size: 20px;
          margin: 0 auto 12px;
          box-shadow: 0 18px 55px rgba(37, 99, 235, 0.5);
        }

        .sa-hero-title {
          margin: 0;
          font-size: 40px;
          letter-spacing: -0.04em;
          color: #020617;
        }

        .sa-hero-subtitle {
          margin: 8px 0 12px;
          font-size: 17px;
          color: #4b5563;
        }

        .sa-hero-text {
          margin: 0 0 24px;
          font-size: 14px;
          color: #6b7280;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        .sa-hero-button {
          border: none;
          border-radius: 999px;
          padding: 10px 26px;
          font-size: 15px;
          font-weight: 600;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #f9fafb;
          cursor: pointer;
          box-shadow: 0 14px 40px rgba(22, 163, 74, 0.45);
          transform: translateY(0);
          transition: transform 0.18s ease, box-shadow 0.18s ease,
            filter 0.18s ease;
        }

        .sa-hero-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 50px rgba(22, 163, 74, 0.6);
          filter: brightness(1.03);
        }

        .sa-hero-button:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: 0 10px 28px rgba(22, 163, 74, 0.4);
        }

        .sa-hero-footnote {
          margin-top: 14px;
          font-size: 12px;
          color: #9ca3af;
        }

        /* APP SHELL */

        .sa-app {
          position: absolute;
          inset: 0;
          max-width: 1120px;
          margin: auto;
          padding: 24px 16px 32px;
          opacity: 0;
          transform: translateY(32px) scale(0.98);
          pointer-events: none;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .sa-entered .sa-hero {
          opacity: 0;
          transform: translateY(-32px) scale(0.98);
          pointer-events: none;
        }

        .sa-entered .sa-app {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .sa-app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .sa-app-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sa-logo-small {
          width: 36px;
          height: 36px;
          font-size: 16px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.2);
        }

        .sa-app-title {
          font-size: 18px;
          font-weight: 600;
          color: #020617;
        }

        .sa-app-subtitle {
          font-size: 12px;
          color: #9ca3af;
        }

        .sa-app-badge {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #e5f3ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .sa-app-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.25fr);
          gap: 20px;
          align-items: flex-start;
        }

        .sa-card {
          background: rgba(255, 255, 255, 0.94);
          border-radius: 18px;
          padding: 18px 20px;
          box-shadow: 0 18px 55px rgba(15, 23, 42, 0.12);
          border: 1px solid rgba(226, 232, 240, 0.9);
        }

        .sa-form-card {
          position: relative;
          overflow: hidden;
        }

        .sa-form-card::before {
          content: "";
          position: absolute;
          inset: -40%;
          background: radial-gradient(
            circle at 0 0,
            rgba(59, 130, 246, 0.06),
            transparent 55%
          );
          pointer-events: none;
        }

        .sa-form-card > * {
          position: relative;
          z-index: 1;
        }

        .sa-right-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .sa-section-title {
          margin: 0 0 12px;
          font-size: 16px;
        }

        .sa-form-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .sa-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sa-label {
          font-size: 12px;
          color: #6b7280;
        }

        .sa-input {
          border-radius: 10px;
          border: 1px solid #d1d5db;
          padding: 7px 9px;
          font-size: 13px;
          outline: none;
          background: #f9fafb;
          transition: border-color 0.15s ease, box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .sa-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.15);
          background: #ffffff;
        }

        .sa-field-textarea {
          margin-top: 16px;
        }

        .sa-textarea {
          border-radius: 12px;
          border: 1px solid #d1d5db;
          padding: 9px 10px;
          min-height: 120px;
          resize: vertical;
          font-size: 13px;
          outline: none;
          background: #f9fafb;
          transition: border-color 0.15s ease, box-shadow 0.15s ease,
            background 0.15s ease;
        }

        .sa-textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.15);
          background: #ffffff;
        }

        .sa-primary-button {
          margin-top: 16px;
          width: 100%;
          border-radius: 999px;
          padding: 9px 14px;
          border: none;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: #f9fafb;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 0 14px 40px rgba(22, 163, 74, 0.35);
          transition: transform 0.16s ease, box-shadow 0.16s ease,
            filter 0.16s ease;
        }

        .sa-primary-button:hover {
          transform: translateY(-0.5px);
          box-shadow: 0 18px 50px rgba(22, 163, 74, 0.5);
          filter: brightness(1.03);
        }

        .sa-primary-button:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: 0 10px 26px rgba(22, 163, 74, 0.35);
        }

        .sa-primary-button-disabled {
          opacity: 0.7;
          cursor: default;
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.25);
        }

        .sa-error-text {
          margin-top: 10px;
          font-size: 12px;
          color: #b91c1c;
        }

        .sa-success-text {
          margin-top: 10px;
          font-size: 12px;
          color: #166534;
        }

        .sa-stats-card {
          min-height: 120px;
        }

        .sa-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .sa-stat-pill {
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          padding: 7px 8px 8px;
          background: linear-gradient(135deg, #ffffff, #f3f4f6);
        }

        .sa-stat-label {
          font-size: 11px;
          color: #6b7280;
        }

        .sa-stat-value {
          margin-top: 4px;
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }

        .sa-placeholder {
          margin: 4px 0 0;
          font-size: 13px;
          color: #9ca3af;
        }

        .sa-placeholder-small {
          margin: 4px 0 0;
          font-size: 12px;
          color: #9ca3af;
        }

        .sa-bottom-row {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
          gap: 12px;
        }

        .sa-subtitle {
          margin: 0 0 10px;
          font-size: 14px;
          color: #111827;
        }

        .sa-equity-card {
          min-height: 150px;
        }

        .sa-trades-card {
          min-height: 150px;
        }

        .sa-equity-svg {
          width: 100%;
          height: 120px;
        }

        .sa-trades-list {
          max-height: 170px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sa-trade-row {
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 6px 8px;
          font-size: 12px;
          background: #ffffff;
        }

        .sa-trade-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sa-trade-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 600;
        }

        .sa-trade-sub {
          margin-top: 3px;
          font-size: 11px;
          color: #6b7280;
        }

        /* Responsive */

        @media (max-width: 900px) {
          .sa-app-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .sa-bottom-row {
            grid-template-columns: minmax(0, 1fr);
          }

          .sa-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .sa-hero-inner {
            padding: 32px 22px 28px;
          }

          .sa-hero-title {
            font-size: 32px;
          }

          .sa-app {
            padding-inline: 12px;
          }
        }
      `}</style>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="sa-stat-pill">
      <div className="sa-stat-label">{label}</div>
      <div className="sa-stat-value">{value}</div>
    </div>
  );
}

function EquityCurveMini({
  points
}: {
  points: { time: string; equity: number }[];
}) {
  if (!points.length) return null;

  const width = 320;
  const height = 110;
  const padding = 10;

  const equities = points.map((p) => p.equity);
  const minY = Math.min(...equities);
  const maxY = Math.max(...equities);
  const rangeY = maxY - minY || 1;

  const stepX =
    points.length > 1
      ? (width - padding * 2) / (points.length - 1)
      : 0;

  const path = points
    .map((p, i) => {
      const x = padding + i * stepX;
      const normY = (p.equity - minY) / rangeY;
      const y = height - padding - normY * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg className="sa-equity-svg" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="saEq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="#16a34a"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TradesMini({
  trades
}: {
  trades: BacktestResponse["trades"];
}) {
  return (
    <div className="sa-trades-list">
      {trades.map((t) => {
        const isWin = t.result === "win";
        const isLoss = t.result === "loss";

        const badgeStyle = {
          backgroundColor: isWin
            ? "#dcfce7"
            : isLoss
            ? "#fee2e2"
            : "#e5e7eb",
          color: isWin ? "#166534" : isLoss ? "#b91c1c" : "#374151"
        };

        return (
          <div key={t.id} className="sa-trade-row">
            <div className="sa-trade-main">
              <span className="sa-trade-badge" style={badgeStyle}>
                {t.result.toUpperCase()}
              </span>
              <span>
                {t.direction.toUpperCase()} · {t.rr.toFixed(2)}R
              </span>
            </div>
            <div className="sa-trade-sub">
              {t.entryTime} → {t.exitTime}
            </div>
          </div>
        );
      })}
    </div>
  );
}
