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

  // ---------- HERO SCREEN ----------
  if (!entered) {
    return (
      <div className="sa-root sa-root-dark">
        <div className="sa-hero-dark">
          <div className="sa-hero-glow" />
          <div className="sa-hero-card-dark">
            <div className="sa-logo-orb">SA</div>
            <h1 className="sa-hero-title-dark">Strategy Analyzer</h1>
            <p className="sa-hero-subtitle-dark">
              Hyper-modern AI backtesting for serious day traders.
            </p>
            <p className="sa-hero-text-dark">
              Define your strategy. Choose a symbol and timeframe. Let the
              engine simulate trades, stats and an equity curve – in seconds,
              not hours of manual backtesting.
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

  // ---------- APP SCREEN ----------
  const hasResult = !!result;

  return (
    <div className="sa-root sa-root-dark">
      <main className="sa-app-shell">
        <header className="sa-app-header-dark">
          <div className="sa-app-brand">
            <div className="sa-logo-orb sa-logo-orb-small">SA</div>
            <div>
              <div className="sa-app-title-dark">Strategy Analyzer</div>
              <div className="sa-app-subtitle-dark">
                AI-powered backtest workstation
              </div>
            </div>
          </div>
          <div className="sa-app-badges">
            <span className="sa-tag">Alpha</span>
            <span className="sa-tag sa-tag-soft">ICT / price action focus</span>
          </div>
        </header>

        <section className="sa-app-grid-dark">
          {/* LEFT – FORM */}
          <div className="sa-card-dark sa-form-card-dark">
            <h2 className="sa-section-title-dark">Setup</h2>

            <div className="sa-form-grid">
              <div className="sa-field-dark">
                <label className="sa-label-dark">Symbol</label>
                <input
                  className="sa-input-dark"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
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
                <label className="sa-label-dark">Candles</label>
                <input
                  type="number"
                  min={50}
                  max={1500}
                  className="sa-input-dark"
                  value={candles}
                  onChange={(e) => setCandles(Number(e.target.value) || 0)}
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
              {state === "loading" ? "Running backtest..." : "Run backtest"}
            </button>

            {state === "error" && error && (
              <p className="sa-msg-error-dark">{error}</p>
            )}
            {state === "done" && !error && (
              <p className="sa-msg-success-dark">
                Backtest complete. Review the dashboard on the right.
              </p>
            )}
          </div>

          {/* RIGHT – DASHBOARD */}
          <div className="sa-right-column-dark">
            <div className="sa-card-dark sa-stats-card-dark">
              <h2 className="sa-section-title-dark">Stats</h2>
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
                  Run a backtest to see winrate, RR, profit factor and
                  drawdown.
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
          </div>
        </section>
      </main>

      <style jsx global>{globalDarkStyles}</style>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="sa-stat-pill-dark">
      <div className="sa-stat-label-dark">{label}</div>
      <div className="sa-stat-value-dark">{value}</div>
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
      <defs>
        <linearGradient id="saEqDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.05" />
        </linearGradient>
      </defs>
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

/* ---------- GLOBAL DARK STYLES (TEMPLATE LITERAL) ---------- */

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
    padding: 32px 16px 40px;
  }

  /* HERO DARK */

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
    opacity: 0.95;
    filter: blur(6px);
    pointer-events: none;
  }

  .sa-hero-card-dark {
    position: relative;
    background: radial-gradient(circle at top, #020617 0, #020617 55%, #020617 100%);
    border-radius: 26px;
    padding: 40px 42px 34px;
    width: 100%;
    max-width: 640px;
    border: 1px solid rgba(148,163,184,0.45);
    box-shadow:
      0 24px 80px rgba(15,23,42,0.9),
      0 0 0 1px rgba(15,23,42,0.8);
    backdrop-filter: blur(30px);
    text-align: center;
    z-index: 1;
    animation: saHeroIn 0.9s ease-out;
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

  /* APP DARK */

  .sa-app-shell {
    max-width: 1120px;
    width: 100%;
    margin: 0 auto;
    animation: saAppIn 0.5s ease-out;
  }

  @keyframes saAppIn {
    from {
      opacity: 0;
      transform: translateY(16px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .sa-app-header-dark {
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

  .sa-logo-orb-small {
    width: 38px;
    height: 38px;
    font-size: 16px;
    box-shadow: 0 16px 45px rgba(15,23,42,0.9);
  }

  .sa-app-title-dark {
    font-size: 18px;
    font-weight: 600;
    color: #e5e7eb;
  }

  .sa-app-subtitle-dark {
    font-size: 12px;
    color: #64748b;
  }

  .sa-app-badges {
    display: flex;
    gap: 8px;
    align-items: center;
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

  .sa-app-grid-dark {
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr);
    gap: 20px;
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

  .sa-right-column-dark {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .sa-section-title-dark {
    margin: 0 0 12px;
    font-size: 16px;
    color: #f9fafb;
  }

  .sa-form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
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

  @media (max-width: 900px) {
    .sa-app-grid-dark {
      grid-template-columns: minmax(0, 1fr);
    }
    .sa-bottom-row-dark {
      grid-template-columns: minmax(0, 1fr);
    }
    .sa-stats-grid-dark {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .sa-hero-card-dark {
      padding: 32px 22px 26px;
    }
    .sa-hero-title-dark {
      font-size: 30px;
    }
    .sa-app-shell {
      padding-inline: 4px;
    }
  }
`;
