import { useState } from "react";
import type { BacktestResponse } from "../lib/types";

type ViewState = "idle" | "loading" | "error" | "done";
type Tab = "setup" | "dashboard" | "stats";

export default function HomePage() {
  const [entered, setEntered] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("setup");

  const [symbol, setSymbol] = useState("EURUSD");
  const [timeframe, setTimeframe] = useState("1h");

  const today = new Date();
  const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
  const [fromDate, setFromDate] = useState(
    ninetyDaysAgo.toISOString().slice(0, 10)
  );
  const [toDate, setToDate] = useState(today.toISOString().slice(0, 10));

  const [strategyText, setStrategyText] = useState("");
  const [state, setState] = useState<ViewState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResponse | null>(null);

  function computeCandlesCount(): number {
    try {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const ms = end.getTime() - start.getTime();
      const diffDays = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));

      const tf = timeframe.trim().toLowerCase();
      let candlesPerDay = 24;

      if (tf.endsWith("h")) {
        const h = parseFloat(tf.replace("h", "")) || 1;
        candlesPerDay = 24 / h;
      } else if (tf.endsWith("min")) {
        const m = parseFloat(tf.replace("min", "")) || 1;
        candlesPerDay = (24 * 60) / m;
      }

      const estCandles = diffDays * candlesPerDay;
      const safeCandles = Math.max(50, Math.round(estCandles));
      return Math.min(1500, safeCandles);
    } catch {
      return 300;
    }
  }

  const handleRunBacktest = async () => {
    setError(null);

    if (!symbol.trim() || !timeframe.trim() || !strategyText.trim()) {
      setError("Fill all required fields first.");
      setState("error");
      return;
    }

    const candlesCount = computeCandlesCount();
    setState("loading");

    try {
      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.trim(),
          timeframe: timeframe.trim(),
          candles: candlesCount,
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
      setActiveTab("dashboard");
    } catch (err: any) {
      console.error(err);
      setError(String(err.message || err));
      setState("error");
    }
  };

  const hasResult = !!result;

  // ---------- HERO SCREEN (FULLSCREEN) ----------
 if (!entered) {
  return (
    <div className="landing-page">
      <div className="landing-bg" />

      <div className="landing-center">
        <div className="logo-orb">SA</div>

        <h1 className="landing-title">Strategy Analyzer</h1>

        <p className="landing-sub">
          Backtest with confidence — know your edge before risking a cent.
        </p>

        <p className="landing-desc">
          Describe your strategy — indicators, price action, rules, whatever you actually trade.
          The engine converts it into a data-driven backtest so you can judge the idea by results, not by feelings.
        </p>

        <button className="landing-btn" onClick={() => setEntered(true)}>
          Enter app
        </button>

        <p className="landing-note">
          Works with any style — indicators, naked charts, swing, intraday.
        </p>
      </div>

      <style jsx global>{landingFix}</style>
    </div>
  );
}
const landingFix = `
  .landing-page {
    width: 100vw !important;
    height: 100vh !important;
    min-height: 100vh !important;
    margin: 0;
    padding: 0;
    position: relative;
    overflow: hidden !important;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }

  .landing-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(59,130,246,0.35), transparent 55%),
      radial-gradient(circle at 100% 100%, rgba(16,185,129,0.35), transparent 55%),
      radial-gradient(circle at 50% 160%, rgba(34,197,94,0.15), transparent 60%);
    filter: blur(20px);
    z-index: 1;
  }

  .landing-center {
    width: 100%;
    max-width: 900px;
    text-align: center;
    padding: 0 40px;
    position: relative;
    z-index: 5;
    animation: fadeIn 1s ease-out forwards;
  }

  .logo-orb {
    width: 90px;
    height: 90px;
    border-radius: 9999px;
    background: radial-gradient(circle at 30% 0, #38bdf8 0, #1d4ed8 40%, #020617 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 30px;
    font-weight: bold;
    color: #e5e7eb;
    margin: 0 auto 26px;
    box-shadow: 0 28px 110px rgba(37,99,235,0.8);
  }

  .landing-title {
    font-size: 64px;
    color: #fff;
    margin: 0 0 12px;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .landing-sub {
    font-size: 26px;
    color: #d1d5db;
    margin-bottom: 18px;
  }

  .landing-desc {
    font-size: 18px;
    color: #9ca3af;
    max-width: 650px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }

  .landing-btn {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border: none;
    border-radius: 999px;
    padding: 18px 58px;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
    color: #022c22;
    box-shadow: 0 30px 80px rgba(22,163,74,0.6);
    transition: 0.25s ease;
  }

  .landing-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 40px 120px rgba(22,163,74,0.9);
  }

  .landing-note {
    margin-top: 22px;
    font-size: 15px;
    color: #64748b;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;


  // ---------- APP LAYOUT (BLACK LUXURY, WIDE) ----------
  return (
    <div className="sa-root-dark">
      <div className="sa-shell">
        {/* SIDEBAR – ALL CONTENT AT TOP */}
        <aside className="sa-sidebar">
          <div className="sa-sidebar-top">
            <div className="sa-sidebar-logo">
              <div className="sa-logo-orb sa-logo-orb-small">SA</div>
              <div className="sa-sidebar-brand">
                <span className="sa-sidebar-name">Strategy Analyzer</span>
                <span className="sa-sidebar-tagline">
                  Your rules. Your data.
                </span>
              </div>
            </div>

            <nav className="sa-sidebar-nav">
              <SidebarButton
                label="Setup"
                active={activeTab === "setup"}
                onClick={() => setActiveTab("setup")}
              />
              <SidebarButton
                label="Dashboard"
                active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              />
              <SidebarButton
                label="Statistics"
                active={activeTab === "stats"}
                onClick={() => setActiveTab("stats")}
              />
            </nav>
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="sa-main">
          <header className="sa-main-header">
            <div>
              <div className="sa-main-title">Trading workspace</div>
              <div className="sa-main-subtitle">
                Backtest any strategy – indicators or pure price action.
              </div>
            </div>

            {hasResult && (
              <div className="sa-main-summary">
                <span className="sa-main-summary-label">Last winrate</span>
                <span className="sa-main-summary-value">
                  {(result!.stats.winrate * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </header>

          {/* TAB CONTENT */}
          {activeTab === "setup" && (
            <section className="sa-tab-grid">
              <div className="sa-card sa-card-form">
                <h2 className="sa-section-title">Setup</h2>

                <div className="sa-form-grid">
                  <div className="sa-field">
                    <label className="sa-label">Symbol</label>
                    <input
                      className="sa-input"
                      value={symbol}
                      onChange={(e) =>
                        setSymbol(e.target.value.toUpperCase())
                      }
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
                    <label className="sa-label">From date</label>
                    <input
                      type="date"
                      className="sa-input"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="sa-field">
                    <label className="sa-label">To date</label>
                    <input
                      type="date"
                      className="sa-input"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sa-field sa-field-textarea">
                  <label className="sa-label">Strategy description</label>
                  <textarea
                    className="sa-textarea"
                    value={strategyText}
                    onChange={(e) => setStrategyText(e.target.value)}
                    placeholder={`Explain YOUR system, not ours. Example:
- HTF bias (daily/4h)
- Entry: break + retest with EMA + RSI filter
- Or: liquidity sweep + MSS + FVG
- Risk per trade, RR target, when you skip trades`}
                  />
                </div>

                <button
                  className={
                    state === "loading"
                      ? "sa-primary-btn sa-primary-btn-disabled"
                      : "sa-primary-btn"
                  }
                  onClick={handleRunBacktest}
                  disabled={state === "loading"}
                >
                  {state === "loading"
                    ? "Running backtest..."
                    : "Run backtest"}
                </button>

                {state === "error" && error && (
                  <p className="sa-msg-error">{error}</p>
                )}
                {state === "done" && !error && (
                  <p className="sa-msg-success">
                    Backtest complete. Check the dashboard and statistics.
                  </p>
                )}
              </div>

              <div className="sa-card sa-card-help">
                <h3 className="sa-subtitle">How to describe your own strategy</h3>
                <ul className="sa-help-list">
                  <li>Write what YOU actually trade – not a template.</li>
                  <li>Include any indicators you use (EMA, RSI, VWAP, etc.).</li>
                  <li>Explain entries, exits, risk and when you stay out.</li>
                  <li>
                    The engine doesn&apos;t judge style – it just tests the rules.
                  </li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === "dashboard" && (
            <section className="sa-tab-stack">
              <div className="sa-card">
                <h2 className="sa-section-title">Dashboard</h2>
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
                    Run a backtest in the Setup tab to populate your dashboard.
                  </p>
                )}
              </div>

              <div className="sa-row">
                <div className="sa-card sa-card-equity">
                  <h3 className="sa-subtitle">Equity curve (R)</h3>
                  {hasResult && result!.equityCurve.length > 1 ? (
                    <EquityCurveMini points={result!.equityCurve} />
                  ) : (
                    <p className="sa-placeholder-small">
                      Equity curve will appear here once you have trades.
                    </p>
                  )}
                </div>

                <div className="sa-card sa-card-trades">
                  <h3 className="sa-subtitle">Recent trades</h3>
                  {hasResult && result!.trades.length > 0 ? (
                    <TradesMini trades={result!.trades.slice(0, 8)} />
                  ) : (
                    <p className="sa-placeholder-small">
                      No trades yet. Run a backtest to see a trade list.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === "stats" && (
            <section className="sa-tab-stack">
              <div className="sa-card">
                <h2 className="sa-section-title">Statistics</h2>
                {hasResult ? (
                  <div className="sa-stats-detail">
                    <StatRow
                      label="Winrate"
                      value={`${(result!.stats.winrate * 100).toFixed(2)}%`}
                    />
                    <StatRow
                      label="Average RR"
                      value={result!.stats.rr.toFixed(2)}
                    />
                    <StatRow
                      label="Profit factor"
                      value={result!.stats.profitFactor.toFixed(2)}
                    />
                    <StatRow
                      label="Max drawdown (R)"
                      value={result!.stats.maxDrawdown.toFixed(2)}
                    />
                    <StatRow
                      label="Number of trades"
                      value={result!.trades.length.toString()}
                    />
                  </div>
                ) : (
                  <p className="sa-placeholder">
                    You&apos;ll see detailed statistics here after your first
                    backtest.
                  </p>
                )}
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx global>{globalDarkStyles}</style>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function SidebarButton({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active ? "sa-sidebar-btn sa-sidebar-btn-active" : "sa-sidebar-btn"
      }
      onClick={onClick}
    >
      <span className="sa-sidebar-dot" />
      <span>{label}</span>
    </button>
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

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sa-stat-row">
      <span className="sa-stat-row-label">{label}</span>
      <span className="sa-stat-row-value">{value}</span>
    </div>
  );
}

function EquityCurveMini({
  points
}: {
  points: { time: string; equity: number }[];
}) {
  if (!points.length) return null;

  const width = 380;
  const height = 140;
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
      <path
        d={path}
        fill="none"
        stroke="#22c55e"
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
            ? "rgba(34,197,94,0.18)"
            : isLoss
            ? "rgba(248,113,113,0.18)"
            : "rgba(148,163,184,0.25)",
          color: isWin ? "#bbf7d0" : isLoss ? "#fecaca" : "#e5e7eb",
          borderColor: isWin
            ? "rgba(34,197,94,0.65)"
            : isLoss
            ? "rgba(248,113,113,0.7)"
            : "rgba(148,163,184,0.7)"
        };

        return (
          <div key={t.id} className="sa-trade-row">
            <div className="sa-trade-main">
              <span className="sa-trade-badge" style={badgeStyle}>
                {t.result.toUpperCase()}
              </span>
              <span className="sa-trade-main-text">
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

/* ---------- GLOBAL STYLES (BLACK LUXURY) ---------- */

const globalDarkStyles = `
  :root {
    color-scheme: dark;
  }

  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    background: radial-gradient(circle at top, #020617 0, #020617 40%, #000 100%);
    color: #e5e7eb;
  }

  * {
    box-sizing: border-box;
  }

  .sa-root-dark {
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    justify-content: center;
    padding: 0;
  }

  /* HERO FULLSCREEN */

  .sa-hero-wrap {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .sa-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(59,130,246,0.35), transparent 55%),
      radial-gradient(circle at 100% 100%, rgba(16,185,129,0.45), transparent 55%),
      radial-gradient(circle at 50% 120%, rgba(251,191,36,0.12), transparent 60%);
    opacity: 0.95;
    filter: blur(4px);
    pointer-events: none;
  }

  .sa-hero-card {
    position: relative;
    max-width: 720px;
    width: 100%;
    margin: 0 24px;
    border-radius: 28px;
    padding: 46px 44px 38px;
    background: radial-gradient(circle at top, #020617 0, #020617 55%, #020617);
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow:
      0 32px 120px rgba(0,0,0,0.95),
      0 0 0 1px rgba(15,23,42,0.9);
    text-align: center;
    z-index: 1;
    animation: saHeroIn 0.9s ease-out;
  }

  .sa-logo-orb {
    width: 56px;
    height: 56px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 30% 0, #38bdf8 0, #1d4ed8 40%, #020617 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    color: #e5e7eb;
    margin: 0 auto 14px;
    box-shadow: 0 22px 65px rgba(37,99,235,0.9);
  }

  .sa-hero-title {
    margin: 0;
    font-size: 40px;
    letter-spacing: -0.05em;
    color: #f9fafb;
  }

  .sa-hero-subtitle {
    margin: 12px 0 12px;
    font-size: 18px;
    color: #e5e7eb;
  }

  .sa-hero-text {
    margin: 0 0 26px;
    font-size: 14px;
    color: #9ca3af;
    max-width: 540px;
    margin-left: auto;
    margin-right: auto;
  }

  .sa-hero-btn {
    border: none;
    border-radius: 999px;
    padding: 11px 32px;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #052e16;
    cursor: pointer;
    box-shadow: 0 24px 70px rgba(34,197,94,0.7);
    transform: translateY(0);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }

  .sa-hero-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 30px 90px rgba(34,197,94,0.9);
    filter: brightness(1.05);
  }

  .sa-hero-btn:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: 0 18px 50px rgba(34,197,94,0.75);
  }

  .sa-hero-footnote {
    margin-top: 16px;
    font-size: 12px;
    color: #64748b;
  }

  @keyframes saHeroIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* APP SHELL – WIDE LAYOUT */

  .sa-shell {
    max-width: 1360px;
    width: 100%;
    margin: 24px auto 32px;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 18px;
  }

  .sa-sidebar {
    border-radius: 20px;
    padding: 16px 14px 14px;
    background: #020617;
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow: 0 24px 80px rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .sa-sidebar-top {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .sa-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sa-logo-orb-small {
    width: 34px;
    height: 34px;
    font-size: 15px;
    box-shadow: 0 16px 45px rgba(15,23,42,0.9);
  }

  .sa-sidebar-brand {
    display: flex;
    flex-direction: column;
  }

  .sa-sidebar-name {
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-sidebar-tagline {
    font-size: 11px;
    color: #64748b;
  }

  .sa-sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sa-sidebar-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: #9ca3af;
    padding: 7px 10px;
    font-size: 13px;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }

  .sa-sidebar-btn:hover {
    background: rgba(15,23,42,0.9);
    color: #e5e7eb;
    transform: translateY(-1px);
  }

  .sa-sidebar-btn-active {
    background: linear-gradient(to right, #22c55e, #16a34a);
    color: #022c22;
  }

  .sa-sidebar-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(148,163,184,0.8);
  }

  .sa-sidebar-btn-active .sa-sidebar-dot {
    background: rgba(15,23,42,0.95);
  }

  .sa-main {
    border-radius: 20px;
    padding: 18px 20px 20px;
    background: radial-gradient(circle at top left, #020617 0, #020617 55%, #020617);
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow: 0 24px 80px rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .sa-main-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sa-main-title {
    font-size: 18px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-main-subtitle {
    font-size: 12px;
    color: #64748b;
  }

  .sa-main-summary {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }

  .sa-main-summary-label {
    font-size: 11px;
    color: #64748b;
  }

  .sa-main-summary-value {
    font-size: 18px;
    font-weight: 600;
    color: #22c55e;
  }

  /* TABS */

  .sa-tab-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.9fr);
    gap: 16px;
    align-items: flex-start;
  }

  .sa-tab-stack {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sa-card {
    background: radial-gradient(circle at top left, #020617 0, #020617 45%, #020617);
    border-radius: 18px;
    padding: 18px 20px;
    border: 1px solid rgba(31,41,55,0.9);
    box-shadow: 0 18px 55px rgba(0,0,0,0.9);
  }

  .sa-card-form {
    position: relative;
    overflow: hidden;
  }

  .sa-card-form::before {
    content: "";
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 0 0, rgba(59,130,246,0.25), transparent 60%);
    opacity: 0.9;
    pointer-events: none;
  }

  .sa-card-form > * {
    position: relative;
    z-index: 1;
  }

  .sa-section-title {
    margin: 0 0 14px;
    font-size: 16px;
    color: #f9fafb;
  }

  .sa-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .sa-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sa-label {
    font-size: 12px;
    color: #9ca3af;
  }

  .sa-input {
    border-radius: 10px;
    border: 1px solid #1f2937;
    padding: 8px 10px;
    font-size: 13px;
    outline: none;
    background: #020617;
    color: #e5e7eb;
    transition: border-color 0.15s ease, box-shadow 0.15s ease,
      background 0.15s ease;
  }

  .sa-input:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
    background: #020617;
  }

  .sa-field-textarea {
    margin-top: 18px;
  }

  .sa-textarea {
    border-radius: 12px;
    border: 1px solid #1f2937;
    padding: 10px 11px;
    min-height: 130px;
    resize: vertical;
    font-size: 13px;
    outline: none;
    background: #020617;
    color: #e5e7eb;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .sa-textarea:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
  }

  .sa-primary-btn {
    margin-top: 18px;
    width: 100%;
    border-radius: 999px;
    padding: 10px 16px;
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #022c22;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 18px 55px rgba(22,163,74,0.65);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }

  .sa-primary-btn:hover {
    transform: translateY(-0.5px);
    box-shadow: 0 24px 70px rgba(22,163,74,0.85);
    filter: brightness(1.05);
  }

  .sa-primary-btn:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: 0 14px 40px rgba(22,163,74,0.7);
  }

  .sa-primary-btn-disabled {
    opacity: 0.7;
    cursor: default;
    box-shadow: 0 10px 30px rgba(22,163,74,0.55);
  }

  .sa-msg-error {
    margin-top: 10px;
    font-size: 12px;
    color: #fecaca;
  }

  .sa-msg-success {
    margin-top: 10px;
    font-size: 12px;
    color: #bbf7d0;
  }

  .sa-card-help {
    min-height: 160px;
  }

  .sa-subtitle {
    margin: 0 0 10px;
    font-size: 14px;
    color: #e5e7eb;
  }

  .sa-help-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: #9ca3af;
  }

  .sa-tab-stack .sa-card:first-child {
    margin-bottom: 4px;
  }

  .sa-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .sa-stat-pill {
    border-radius: 12px;
    border: 1px solid rgba(51,65,85,0.9);
    padding: 7px 8px 8px;
    background: radial-gradient(circle at top, #020617 0, #020617 60%, #020617);
  }

  .sa-stat-label {
    font-size: 11px;
    color: #9ca3af;
  }

  .sa-stat-value {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-placeholder {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .sa-placeholder-small {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .sa-row {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1.05fr);
    gap: 14px;
  }

  .sa-card-equity {
    min-height: 160px;
  }

  .sa-card-trades {
    min-height: 160px;
  }

  .sa-equity-svg {
    width: 100%;
    height: 140px;
  }

  .sa-trades-list {
    max-height: 190px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sa-trade-row {
    border-radius: 10px;
    border: 1px solid rgba(31,41,55,0.9);
    padding: 6px 8px;
    font-size: 12px;
    background: #020617;
  }

  .sa-trade-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .sa-trade-badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
    border: 1px solid transparent;
  }

  .sa-trade-main-text {
    color: #e5e7eb;
  }

  .sa-trade-sub {
    margin-top: 3px;
    font-size: 11px;
    color: #9ca3af;
  }

  .sa-stats-detail {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sa-stat-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 6px 0;
    border-bottom: 1px solid rgba(31,41,55,0.9);
  }

  .sa-stat-row-label {
    color: #9ca3af;
  }

  .sa-stat-row-value {
    color: #e5e7eb;
    font-weight: 500;
  }

  @media (max-width: 1100px) {
    .sa-shell {
      grid-template-columns: 200px minmax(0, 1fr);
    }
    .sa-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .sa-row {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 900px) {
    .sa-shell {
      grid-template-columns: minmax(0, 1fr);
    }
    .sa-sidebar {
      display: none;
    }
    .sa-tab-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .sa-hero-card {
      padding: 34px 22px 26px;
    }
    .sa-hero-title {
      font-size: 32px;
    }
  }
`;
