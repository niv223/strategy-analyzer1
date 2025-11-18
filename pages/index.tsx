import { useState } from "react";
import Head from "next/head";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
  Legend
} from "chart.js";
import type { BacktestResponse } from "../lib/types";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip, Legend);

export default function Home() {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState("1h");
  const [candles, setCandles] = useState(500);
  const [strategyText, setStrategyText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BacktestResponse | null>(null);

  async function runBacktest() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          timeframe,
          candles,
          strategyText
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Backtest failed");
      }

      const data = (await res.json()) as BacktestResponse;
      setResult(data);
    } catch (e: any) {
      console.error(e);
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  const equityData =
    result?.equityCurve && result.equityCurve.length > 0
      ? {
          labels: result.equityCurve.map((p) => p.time),
          datasets: [
            {
              label: "Equity (R)",
              data: result.equityCurve.map((p) => p.equity),
              fill: true,
              tension: 0.32,
              borderColor: "#22c55e",
              backgroundColor: "rgba(34,197,94,0.12)",
              pointRadius: 0
            }
          ]
        }
      : null;

  return (
    <>
      <Head>
        <title>Strategy Analyzer</title>
      </Head>
      <main>
        <div style={{ marginBottom: "1.8rem", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "0.75rem", letterSpacing: "0.24em", textTransform: "uppercase", color: "#6b7280", marginBottom: "0.5rem" }}>
              STRATEGY ANALYZER
            </div>
            <h1 className="hero-title">
              Stop guessing.{" "}
              <span className="hero-highlight">Prove your edge.</span>
            </h1>
            <p className="hero-sub">
              Describe your rules once. Let AI translate it into logic and stress test it on real historical data. Built for discretionary daytraders.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="badge green">
              <span style={{ width: 8, height: 8, borderRadius: "999px", background: "#22c55e", boxShadow: "0 0 0 4px rgba(34,197,94,0.2)" }} />
              Live AI engine
            </div>
          </div>
        </div>

        <div className="shell">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.1fr)", gap: "1.2rem", marginBottom: "1.5rem" }}>
            <div className="card">
              <h2 style={{ fontSize: "0.95rem", marginTop: 0, marginBottom: "0.75rem" }}>Market & risk</h2>
              <div className="row">
                <div>
                  <label>Symbol</label>
                  <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="EUR/USD, XAU/USD, NAS100..."
                  />
                </div>
                <div>
                  <label>Timeframe</label>
                  <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                    <option value="15min">15 min</option>
                    <option value="1h">1 hour</option>
                    <option value="4h">4 hours</option>
                    <option value="1day">1 day</option>
                  </select>
                </div>
                <div>
                  <label>Candles to test</label>
                  <input
                    type="number"
                    value={candles}
                    min={100}
                    max={1500}
                    onChange={(e) => setCandles(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label>Strategy notes (free text)</label>
                <textarea
                  value={strategyText}
                  onChange={(e) => setStrategyText(e.target.value)}
                  placeholder="Example: Only long in London if daily & H4 are bullish. Wait for liquidity sweep then M5 MSS, enter on FVG with 2.5R TP, move to BE after 1R, max 3 trades per session..."
                />
              </div>
              <div style={{ marginTop: "0.9rem", display: "flex", gap: "0.6rem", alignItems: "center" }}>
                <button
                  className="primary"
                  onClick={runBacktest}
                  disabled={loading || !strategyText.trim()}
                >
                  {loading ? "Running backtest..." : "Run backtest"}
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                >
                  Clear
                </button>
              </div>
              {error && (
                <p style={{ marginTop: "0.7rem", fontSize: "0.8rem", color: "#f87171", whiteSpace: "pre-wrap" }}>
                  {error}
                </p>
              )}
              {!strategyText && !result && !loading && (
                <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
                  Paste your strategy once. The engine will infer entries, exits and estimate your performance on the last N candles.
                </p>
              )}
            </div>

            <div className="card soft">
              <h2 style={{ fontSize: "0.95rem", marginTop: 0, marginBottom: "0.75rem" }}>Stats preview</h2>
              {result ? (
                <>
                  <div className="stats-grid">
                    <div className="stat-box">
                      <div className="stat-label">Win rate</div>
                      <div className="stat-value">
                        {result.stats.winrate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Average R</div>
                      <div className="stat-value">
                        {result.stats.rr.toFixed(2)}R
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Profit factor</div>
                      <div className="stat-value">
                        {result.stats.profitFactor.toFixed(2)}
                      </div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">Max drawdown</div>
                      <div className="stat-value">
                        {result.stats.maxDrawdown.toFixed(2)}R
                      </div>
                    </div>
                  </div>
                  <div className="charts">
                    {equityData && (
                      <div className="card" style={{ marginTop: "0.9rem" }}>
                        <div className="stat-label" style={{ marginBottom: "0.3rem" }}>
                          Equity curve
                        </div>
                        <Line
                          data={equityData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { display: false },
                              tooltip: { mode: "index", intersect: false }
                            },
                            scales: {
                              x: {
                                display: false
                              },
                              y: {
                                ticks: { color: "#9ca3af", font: { size: 10 } },
                                grid: { color: "rgba(31,41,55,0.6)" }
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                    <div className="card" style={{ marginTop: "0.9rem" }}>
                      <div className="stat-label" style={{ marginBottom: "0.3rem" }}>
                        Trade distribution (top 10)
                      </div>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Dir</th>
                            <th>R</th>
                            <th>Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.trades.slice(0, 10).map((t) => (
                            <tr key={t.id}>
                              <td>{t.id}</td>
                              <td>{t.direction}</td>
                              <td>{t.rr.toFixed(2)}</td>
                              <td>{t.result}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "0.8rem", color: "#e5e7eb" }}>
                  Once you run a backtest, you&apos;ll see winrate, R-metrics and equity curve here.
                  This is your prop-firm pass/fail simulator.
                </p>
              )}
            </div>
          </div>

          <div className="card" style={{ marginTop: "0.5rem" }}>
            <h2 style={{ fontSize: "0.9rem", marginTop: 0, marginBottom: "0.5rem" }}>Raw trades</h2>
            {result && result.trades.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Direction</th>
                    <th>Entry</th>
                    <th>Exit</th>
                    <th>R</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.direction}</td>
                      <td>{t.entryTime}</td>
                      <td>{t.exitTime}</td>
                      <td>{t.rr.toFixed(2)}</td>
                      <td>{t.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                Use this table later to export trades into a CSV, prop-firm journal or your own Google Sheet.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
