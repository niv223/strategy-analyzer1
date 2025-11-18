"use client";

import { useState } from "react";

export default function TestPage() {
  const [symbol, setSymbol] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState("1h");
  const [from, setFrom] = useState("2024-01-01");
  const [to, setTo] = useState("2024-06-01");
  const [risk, setRisk] = useState(0.8);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleRun() {
    try {
      setLoading(true);
      setError("");
      setResult(null);
      setStrategy(null);

      const interpretRes = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!interpretRes.ok) {
        throw new Error("Failed to interpret strategy");
      }

      const interpretData = await interpretRes.json();
      const strategySpec = {
        ...(interpretData.strategy || {}),
        riskPerTrade: Number(risk) || 0.8,
        timeframe,
        notes,
      };
      setStrategy(strategySpec);

      const backtestRes = await fetch("/api/backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: strategySpec,
          symbol,
          from,
          to,
        }),
      });

      if (!backtestRes.ok) {
        const e = await backtestRes.json().catch(() => ({}));
        throw new Error(e.error || "Backtest failed");
      }

      const backtestData = await backtestRes.json();
      setResult(backtestData);
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <h1 className="text-2xl font-semibold mb-4">Test your strategy</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-4 md:col-span-1">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Symbol</label>
            <input
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="EUR/USD, XAU/USD, NAS100..."
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Timeframe
            </label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="15min">15min</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1day">1 day</option>
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">From</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">To</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Risk per trade (%)
            </label>
            <input
              type="number"
              step="0.1"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm"
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
            />
          </div>
          <button
            onClick={handleRun}
            disabled={loading}
            className="w-full mt-2 px-4 py-2 rounded-lg bg-emerald-500 text-black text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Running backtest..." : "Run backtest"}
          </button>
          {error && (
            <p className="text-xs text-red-400 mt-2 whitespace-pre-wrap">
              {error}
            </p>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Strategy notes (free text, ICT, conditions, etc.)
            </label>
            <textarea
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm min-h-[160px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Example: Only trade long in London if daily + H4 bullish, wait for liquidity sweep and MSS on M5, target 2.5R, max 3 trades per day, no trading 30m before red news..."
            />
          </div>

          {strategy && (
            <div className="border border-zinc-800 rounded-lg p-3 text-xs bg-zinc-950/60">
              <div className="text-zinc-400 mb-1">AI-parsed strategy:</div>
              <pre className="whitespace-pre-wrap text-[11px] text-zinc-300">
                {JSON.stringify(strategy, null, 2)}
              </pre>
            </div>
          )}

          {result && (
            <div className="border border-zinc-800 rounded-lg p-3 text-sm bg-zinc-950/60 space-y-2">
              <div className="flex gap-4 text-xs md:text-sm">
                <div>
                  <div className="text-zinc-400 text-[11px] uppercase tracking-[0.15em]">
                    Total trades
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    {result.stats.totalTrades}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[11px] uppercase tracking-[0.15em]">
                    Win rate
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    {result.stats.winRate.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-zinc-400 text-[11px] uppercase tracking-[0.15em]">
                    Avg R
                  </div>
                  <div className="text-emerald-400 font-semibold">
                    {result.stats.avgR.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-zinc-500">
                Later you can add full equity charts with Recharts using{" "}
                <code>result.stats.equityCurve</code>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
