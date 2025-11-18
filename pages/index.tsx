import { useState } from "react";
import type { BacktestResponse } from "../lib/types";

type ViewState = "idle" | "loading" | "error" | "done";

export default function HomePage() {
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
      setError("Fill all fields");
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
        throw new Error(data?.error || `Request failed: ${res.status}`);
      }
      const data = (await res.json()) as BacktestResponse;
      setResult(data);
      setState("done");
    } catch (err: any) {
      setError(String(err.message || err));
      setState("error");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e5e7eb", padding: 24 }}>
      <main style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Strategy Analyzer</h1>
        <p style={{ marginTop: 0, marginBottom: 24, color: "#9ca3af" }}>
          Simple AI backtest tool for your day trading ideas.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr", gap: 16 }}>
          <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Setup</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              <div>
                <label style={{ fontSize: 12, color: "#9ca3af" }}>Symbol</label>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  style={{ width: "100%", marginTop: 4, borderRadius: 8, border: "1px solid #374151", background: "#020617", color: "#e5e7eb", padding: "6px 8px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#9ca3af" }}>Timeframe</label>
                <input
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  style={{ width: "100%", marginTop: 4, borderRadius: 8, border: "1px solid #374151", background: "#020617", color: "#e5e7eb", padding: "6px 8px" }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#9ca3af" }}>Candles</label>
                <input
                  type="number"
                  min={50}
                  max={1500}
                  value={candles}
                  onChange={(e) => setCandles(Number(e.target.value) || 0)}
                  style={{ width: "100%", marginTop: 4, borderRadius: 8, border: "1px solid #374151", background: "#020617", color: "#e5e7eb", padding: "6px 8px" }}
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 12, color: "#9ca3af" }}>Strategy</label>
              <textarea
                value={strategyText}
                onChange={(e) => setStrategyText(e.target.value)}
                style={{ width: "100%", marginTop: 4, borderRadius: 8, border: "1px solid #374151", background: "#020617", color: "#e5e7eb", padding: 8, minHeight: 120 }}
              />
            </div>

            <button
              onClick={handleRunBacktest}
              disabled={state === "loading"}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "8px 12px",
                borderRadius: 999,
                border: "none",
                background: state === "loading" ? "#16a34a99" : "#16a34a",
                color: "#020617",
                fontWeight: 600,
                cursor: state === "loading" ? "default" : "pointer"
              }}
            >
              {state === "loading" ? "Running..." : "Run backtest"}
            </button>

            {state === "error" && error && (
              <p style={{ marginTop: 8, fontSize: 12, color: "#fca5a5" }}>{error}</p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Stats</h2>
              {result ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 }}>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Winrate</div>
                    <div>{(result.stats.winrate * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Avg RR</div>
                    <div>{result.stats.rr.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Profit factor</div>
                    <div>{result.stats.profitFactor.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ color: "#9ca3af", fontSize: 11 }}>Max DD (R)</div>
                    <div>{result.stats.maxDrawdown.toFixed(2)}</div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Run a backtest to see stats.</p>
              )}
            </div>

            <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 12, padding: 16 }}>
              <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 16 }}>Recent trades</h2>
              {result && result.trades.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                  {result.trades.slice(0, 8).map((t) => (
                    <div key={t.id} style={{ border: "1px solid #374151", borderRadius: 8, padding: 6, fontSize: 12 }}>
                      <div>
                        {t.direction.toUpperCase()} · {t.rr.toFixed(2)}R · {t.result.toUpperCase()}
                      </div>
                      <div style={{ color: "#9ca3af", fontSize: 11 }}>
                        {t.entryTime} → {t.exitTime}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>No trades yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
