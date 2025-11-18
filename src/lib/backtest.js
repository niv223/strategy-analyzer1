// Very simple placeholder backtest.
// In real life you would pull candles from TwelveData and simulate.
// This just creates fake metrics from rr and risk.

export function runBacktestLocally(form, aiRules) {
  const trades = 80;
  const winrate = 0.52;
  const avgRR = Number(form.rr || 2.0);
  const risk = Number(form.risk || 1);

  const wins = Math.round(trades * winrate);
  const losses = trades - wins;
  const profitR = wins * avgRR - losses * 1;
  const profitPct = profitR * risk;

  const profitFactor = (wins * avgRR) / Math.max(losses, 1);
  const maxDrawdown = -Math.abs(losses * risk * 0.5);

  return {
    summary: {
      trades,
      wins,
      losses,
      winrate,
      avg_rr: avgRR,
      profit_r: profitR,
      profit_pct: profitPct,
      profit_factor: Number(profitFactor.toFixed(2)),
      max_drawdown: Number(maxDrawdown.toFixed(2)),
    },
    equity_curve: [],
    meta: {
      used_ai_rules: !!aiRules,
    },
  };
}
