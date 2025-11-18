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

  // ---------- HERO SCREEN ----------
  if (!entered) {
    return (
      <div className="sa-root sa-root-dark">
        <div className="sa-hero-dark sa-hero-full">
          <div className="sa-hero-glow" />
          <div className="sa-hero-card-dark sa-hero-card-clean">
            <div className="sa-logo-orb">SA</div>
            <h1 className="sa-hero-title-dark">Strategy Analyzer</h1>
            <p className="sa-hero-subtitle-dark">
              Backtest with confidence — know your edge before risking a cent.
            </p>
            <p className="sa-hero-text-dark">
              Define your strategy, select a symbol and timeframe, and let the
              engine simulate trades, stats and an equity curve so you can make
              decisions based on data, not emotions.
            </p>

            <button
              className="sa-hero-btn-dark"
              onClick={() => setEntered(true)}
            >
              Enter app
            </button>

            <div className="sa-hero-footnote-dark">
              Built for precision traders. No noise. No indicators circus.
            </div>
          </div>
        </div>

        <style jsx global>{globalDarkStyles}</style>
      </div>
    );
  }

  // ---------- APP WITH SIDEBAR ----------
  return (
    <div className="sa-root sa-root-dark">
      <div className="sa-shell-dark">
        {/* SIDEBAR */}
        <aside className="sa-sidebar-dark">
          <div className="sa-sidebar-logo">
            <div className="sa-logo-orb sa-logo-orb-small">SA</div>
            <span className="sa-sidebar-title">Strategy Analyzer</span>
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

          <div className="sa-sidebar-footer">
            <span className="sa-tag sa-tag-soft">Alpha build</span>
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="sa-main-dark">
          {/* TOP BAR */}
          <header className="sa-main-header-dark">
            <div>
              <div className="sa-app-title-dark">Workspace</div>
              <div className="sa-app-subtitle-dark">
                AI-powered backtesting environment
              </div>
            </div>

            {hasResult && (
              <div className="sa-main-summary">
                <span className="sa-main-summary-label">
                  Last run • Winrate
                </span>
                <span className="sa-main-summary-value">
                  {(result!.stats.winrate * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </header>

          {/* CONTENT BY TAB */}
          {activeTab === "setup" && (
            <section className="sa-tab-layout">
              <div className="sa-card-dark sa-form-card-dark">
                <h2 className="sa-section-title-dark">Setup</h2>

                <div className="sa-form-grid-2col">
                  <div className="sa-field-dark">
                    <label className="sa-label-dark">Symbol</label>
                    <input
                      className="sa-input-dark"
                      value={symbol}
                      onChange={(e) =>
                        setSymbol(e.target.value.toUpperCase())
                      }
                      placeholder="EURUSD, XAUUSD, NAS100..."
                    />
                  </div>

                  <div className="sa-field-dark">
                    <label className="sa-label-dark">Timeframe</label>
                    <input
                      className="sa-input-dark"
                      value={timeframe}
                      onChange={(e) => setTimeframe(e.target.value)}
                      placeholder="1h, 15min, 5min..."
                    />
                  </div>

                  <div className="sa-field-dark">
                    <label className="sa-label-dark">From</label>
                    <input
                      type="date"
                      className="sa-input-dark"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>

                  <div className="sa-field-dark">
                    <label className="sa-label-dark">To</label>
                    <input
                      type="date"
                      className="sa-input-dark"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sa-field-dark sa-field-textarea-dark">
                  <label className="sa-label-dark">Strategy description</label>
                  <textarea
                    className="sa-textarea-dark"
                    value={strategyText}
                    onChange={(e) => setStrategyText(e.target.value)}
                    placeholder={`Example:
- Daily bias from HTF
- Entry after liquidity sweep + MSS
- Use FVG for entry
- 1% risk per trade, 2.5R target`}
                  />
                </div>

                <button
                  className={
                    state === "loading"
                      ? "sa-primary-btn-dark sa-primary-btn-dark-disabled"
                      : "sa-primary-btn-dark"
                  }
                  onClick={handleRunBacktest}
                  disabled={state === "loading"}
                >
                  {state === "loading"
                    ? "Running backtest..."
                    : "Run backtest"}
                </button>

                {state === "error" && error && (
                  <p className="sa-msg-error-dark">{error}</p>
                )}
                {state === "done" && !error && (
                  <p className="sa-msg-success-dark">
                    Backtest complete. Check the Dashboard and Statistics tabs.
                  </p>
                )}
              </div>

              <div className="sa-card-dark sa-help-card-dark">
                <h3 className="sa-subtitle-dark">How to write a clean setup</h3>
                <ul className="sa-help-list">
                  <li>Define your HTF bias (daily / 4h).</li>
                  <li>Explain what counts as a liquidity sweep.</li>
                  <li>Describe your MSS + FVG entry criteria.</li>
                  <li>State exact RR targets and stop rules.</li>
                </ul>
              </div>
            </section>
          )}

          {activeTab === "dashboard" && (
            <section className="sa-tab-layout">
              <div className="sa-card-dark sa-stats-card-dark">
                <h2 className="sa-section-title-dark">Dashboard</h2>
                {hasResult ? (
                  <div className="sa-stats-grid-dark">
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
                  <p className="sa-placeholder-dark">
                    Run a backtest in the Setup tab to populate your dashboard.
                  </p>
                )}
              </div>

              <div className="sa-bottom-row-dark">
                <div className="sa-card-dark sa-equity-card-dark">
                  <h3 className="sa-subtitle-dark">Equity curve (R)</h3>
                  {hasResult && result!.equityCurve.length > 1 ? (
                    <EquityCurveMini points={result!.equityCurve} />
                  ) : (
                    <p className="sa-placeholder-small-dark">
                      Equity curve will appear here once you have trades.
                    </p>
                  )}
                </div>

                <div className="sa-card-dark sa-trades-card-dark">
                  <h3 className="sa-subtitle-dark">Recent trades</h3>
                  {hasResult && result!.trades.length > 0 ? (
                    <TradesMini trades={result!.trades.slice(0, 7)} />
                  ) : (
                    <p className="sa-placeholder-small-dark">
                      No trades yet. Run a backtest to see a summary.
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === "stats" && (
            <section className="sa-tab-layout">
              <div className="sa-card-dark sa-stats-card-dark">
                <h2 className="sa-section-title-dark">Statistics</h2>
                {hasResult ? (
                  <div className="sa-stats-detail-grid">
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
                  <p className="sa-placeholder-dark">
                    You&apos;ll see detailed statistics here after your first
                    backtest run.
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

// ---------- SMALL COMPONENTS ----------

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
      <span className="sa-sidebar-bullet" />
      <span>{label}</span>
    </button>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="sa-stat-pill-dark">
      <div className="sa-stat-label-dark">{label}</div>
      <div className="sa-stat-value-dark">{value}</div>
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
    <svg
      className="sa-equity-svg-dark"
      viewBox={`0 0 ${width} ${height}`}
    >
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
    <div className="sa-trades-list-dark">
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
          <div key={t.id} className="sa-trade-row-dark">
            <div className="sa-trade-main-dark">
              <span
                className="sa-trade-badge-dark"
                style={badgeStyle}
              >
                {t.result.toUpperCase()}
              </span>
              <span className="sa-trade-main-text-dark">
                {t.direction.toUpperCase()} · {t.rr.toFixed(2)}R
              </span>
            </div>
            <div className="sa-trade-sub-dark">
              {t.entryTime} → {t.exitTime}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- GLOBAL DARK STYLES ----------

const globalDarkStyles = `
  :root {
    color-scheme: dark;
  }

  body {
    margin: 0;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    background: radial-gradient(circle at top, #020617 0, #020617 45%, #000 100%);
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
    padding: 24px 16px 32px;
  }

  /* HERO */

  .sa-hero-full {
    min-height: calc(100vh - 56px);
  }

  .sa-hero-dark {
    position: relative;
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sa-hero-glow {
    position: absolute;
    inset: -20%;
    background:
      radial-gradient(circle at 10% 0, rgba(59,130,246,0.35) 0, transparent 55%),
      radial-gradient(circle at 90% 100%, rgba(16,185,129,0.35) 0, transparent 55%);
    opacity: 0.9;
    filter: blur(6px);
    pointer-events: none;
  }

  .sa-hero-card-dark {
    position: relative;
    border-radius: 26px;
    padding: 40px 42px 34px;
    width: 100%;
    max-width: 640px;
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow:
      0 24px 90px rgba(0,0,0,0.95),
      0 0 0 1px rgba(15,23,42,0.9);
    backdrop-filter: blur(30px);
    text-align: center;
    z-index: 1;
    animation: saHeroIn 0.9s ease-out;
  }

  .sa-hero-card-clean {
    background: radial-gradient(circle at top, #020617 0, #020617 55%, #020617);
  }

  .sa-logo-orb {
    width: 52px;
    height: 52px;
    border-radius: 999px;
    background:
      radial-gradient(circle at 30% 0, #38bdf8 0, #1d4ed8 40%, #020617 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 20px;
    color: #e5e7eb;
    margin: 0 auto 12px;
    box-shadow: 0 18px 55px rgba(37,99,235,0.8);
  }

  .sa-hero-title-dark {
    margin: 0;
    font-size: 38px;
    letter-spacing: -0.04em;
    color: #f9fafb;
  }

  .sa-hero-subtitle-dark {
    margin: 10px 0 10px;
    font-size: 17px;
    color: #e5e7eb;
  }

  .sa-hero-text-dark {
    margin: 0 0 24px;
    font-size: 14px;
    color: #9ca3af;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }

  .sa-hero-btn-dark {
    border: none;
    border-radius: 999px;
    padding: 10px 26px;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #052e16;
    cursor: pointer;
    box-shadow: 0 20px 55px rgba(34,197,94,0.6);
    transform: translateY(0);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }

  .sa-hero-btn-dark:hover {
    transform: translateY(-1px);
    box-shadow: 0 24px 70px rgba(34,197,94,0.8);
    filter: brightness(1.05);
  }

  .sa-hero-btn-dark:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: 0 16px 42px rgba(34,197,94,0.6);
  }

  .sa-hero-footnote-dark {
    margin-top: 14px;
    font-size: 12px;
    color: #64748b;
  }

  @keyframes saHeroIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* SHELL + SIDEBAR */

  .sa-shell-dark {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 230px minmax(0, 1fr);
    gap: 18px;
  }

  .sa-sidebar-dark {
    border-radius: 18px;
    padding: 16px 14px 14px;
    background: radial-gradient(circle at top, #020617 0, #020617 65%, #020617);
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow: 0 22px 80px rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .sa-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .sa-logo-orb-small {
    width: 34px;
    height: 34px;
    font-size: 15px;
    box-shadow: 0 14px 40px rgba(15,23,42,0.9);
  }

  .sa-sidebar-title {
    font-size: 14px;
    font-weight: 600;
    color: #e5e7eb;
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
    padding: 6px 9px;
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

  .sa-sidebar-btn-active .sa-sidebar-bullet {
    background: rgba(15,23,42,0.9);
  }

  .sa-sidebar-bullet {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: rgba(148,163,184,0.7);
  }

  .sa-sidebar-footer {
    margin-top: 20px;
  }

  .sa-tag {
    font-size: 11px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(59,130,246,0.7);
    background: rgba(15,23,42,0.9);
    color: #bfdbfe;
  }

  .sa-tag-soft {
    border-color: rgba(148,163,184,0.6);
    color: #cbd5f5;
  }

  /* MAIN PANEL */

  .sa-main-dark {
    border-radius: 18px;
    padding: 16px 18px 18px;
    background: radial-gradient(circle at top left, #020617 0, #020617 55%, #020617);
    border: 1px solid rgba(15,23,42,0.95);
    box-shadow: 0 22px 80px rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sa-main-header-dark {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sa-app-title-dark {
    font-size: 16px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-app-subtitle-dark {
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

  /* TAB LAYOUT */

  .sa-tab-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.9fr);
    gap: 14px;
    align-items: flex-start;
  }

  .sa-card-dark {
    background: radial-gradient(circle at top left, #020617 0, #020617 45%, #020617 100%);
    border-radius: 18px;
    padding: 18px 20px;
    border: 1px solid rgba(31,41,55,0.9);
    box-shadow: 0 18px 55px rgba(0,0,0,0.9);
  }

  .sa-form-card-dark {
    position: relative;
    overflow: hidden;
  }

  .sa-form-card-dark::before {
    content: "";
    position: absolute;
    inset: -40%;
    background:
      radial-gradient(circle at 0 0, rgba(59,130,246,0.25), transparent 60%);
    opacity: 0.9;
    pointer-events: none;
  }

  .sa-form-card-dark > * {
    position: relative;
    z-index: 1;
  }

  .sa-section-title-dark {
    margin: 0 0 12px;
    font-size: 16px;
    color: #f9fafb;
  }

  .sa-form-grid-2col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .sa-field-dark {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .sa-label-dark {
    font-size: 12px;
    color: #9ca3af;
  }

  .sa-input-dark {
    border-radius: 10px;
    border: 1px solid #1f2937;
    padding: 7px 9px;
    font-size: 13px;
    outline: none;
    background: #020617;
    color: #e5e7eb;
    transition: border-color 0.15s ease, box-shadow 0.15s ease,
      background 0.15s ease;
  }

  .sa-input-dark:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
    background: #020617;
  }

  .sa-field-textarea-dark {
    margin-top: 16px;
  }

  .sa-textarea-dark {
    border-radius: 12px;
    border: 1px solid #1f2937;
    padding: 9px 10px;
    min-height: 120px;
    resize: vertical;
    font-size: 13px;
    outline: none;
    background: #020617;
    color: #e5e7eb;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .sa-textarea-dark:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56,189,248,0.4);
  }

  .sa-primary-btn-dark {
    margin-top: 16px;
    width: 100%;
    border-radius: 999px;
    padding: 9px 14px;
    border: none;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #022c22;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 18px 55px rgba(22,163,74,0.65);
    transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
  }

  .sa-primary-btn-dark:hover {
    transform: translateY(-0.5px);
    box-shadow: 0 24px 70px rgba(22,163,74,0.85);
    filter: brightness(1.05);
  }

  .sa-primary-btn-dark:active {
    transform: translateY(1px) scale(0.99);
    box-shadow: 0 14px 40px rgba(22,163,74,0.7);
  }

  .sa-primary-btn-dark-disabled {
    opacity: 0.7;
    cursor: default;
    box-shadow: 0 10px 30px rgba(22,163,74,0.55);
  }

  .sa-msg-error-dark {
    margin-top: 10px;
    font-size: 12px;
    color: #fecaca;
  }

  .sa-msg-success-dark {
    margin-top: 10px;
    font-size: 12px;
    color: #bbf7d0;
  }

  .sa-help-card-dark {
    min-height: 150px;
  }

  .sa-help-list {
    margin: 4px 0 0;
    padding-left: 18px;
    font-size: 12px;
    color: #9ca3af;
  }

  .sa-stats-card-dark {
    min-height: 120px;
  }

  .sa-stats-grid-dark {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .sa-stat-pill-dark {
    border-radius: 12px;
    border: 1px solid rgba(51,65,85,0.9);
    padding: 7px 8px 8px;
    background: radial-gradient(circle at top, #020617 0, #020617 60%, #020617);
  }

  .sa-stat-label-dark {
    font-size: 11px;
    color: #9ca3af;
  }

  .sa-stat-value-dark {
    margin-top: 4px;
    font-size: 15px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-placeholder-dark {
    margin: 4px 0 0;
    font-size: 13px;
    color: #6b7280;
  }

  .sa-placeholder-small-dark {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
  }

  .sa-bottom-row-dark {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
    gap: 12px;
  }

  .sa-subtitle-dark {
    margin: 0 0 10px;
    font-size: 14px;
    color: #e5e7eb;
  }

  .sa-equity-card-dark {
    min-height: 150px;
  }

  .sa-trades-card-dark {
    min-height: 150px;
  }

  .sa-equity-svg-dark {
    width: 100%;
    height: 120px;
  }

  .sa-trades-list-dark {
    max-height: 170px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .sa-trade-row-dark {
    border-radius: 10px;
    border: 1px solid rgba(31,41,55,0.9);
    padding: 6px 8px;
    font-size: 12px;
    background: #020617;
  }

  .sa-trade-main-dark {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .sa-trade-badge-dark {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    font-weight: 600;
    border: 1px solid transparent;
  }

  .sa-trade-main-text-dark {
    color: #e5e7eb;
  }

  .sa-trade-sub-dark {
    margin-top: 3px;
    font-size: 11px;
    color: #9ca3af;
  }

  .sa-stats-detail-grid {
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

  @media (max-width: 1024px) {
    .sa-shell-dark {
      grid-template-columns: 200px minmax(0, 1fr);
    }
  }

  @media (max-width: 900px) {
    .sa-shell-dark {
      grid-template-columns: minmax(0, 1fr);
    }
    .sa-sidebar-dark {
      display: none;
    }
    .sa-tab-layout {
      grid-template-columns: minmax(0, 1fr);
    }
    .sa-stats-grid-dark {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .sa-bottom-row-dark {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  @media (max-width: 640px) {
    .sa-hero-card-dark {
      padding: 32px 22px 26px;
    }
    .sa-hero-title-dark {
      font-size: 30px;
    }
  }
`;
