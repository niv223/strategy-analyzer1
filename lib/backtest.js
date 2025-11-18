function inSession(timeStr, session) {
  if (!session) return true;
  if (!timeStr.includes("T")) return true;
  const timePart = timeStr.split("T")[1];
  const [h, m] = timePart.split(":").map(Number);
  const minutes = h * 60 + m;
  const [sh, sm] = session.start.split(":").map(Number);
  const [eh, em] = session.end.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  return minutes >= startMinutes && minutes <= endMinutes;
}

function generateTradesFromCandles(candles, strategySpec) {
  const trades = [];
  const dir = strategySpec.direction || "both";
  const rr = strategySpec.rr || 2;
  const risk = strategySpec.riskPerTrade || 1;

  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];

    if (!inSession(c.time, strategySpec.session)) continue;

    const isBull = c.close > c.open;
    const isBear = c.close < c.open;

    let side = null;
    if (dir === "long" && isBull) side = "long";
    if (dir === "short" && isBear) side = "short";
    if (dir === "both") {
      side = isBull ? "long" : isBear ? "short" : null;
    }
    if (!side) continue;

    const r = isBull && side === "long" ? 1 : isBear && side === "short" ? 1 : -1;

    trades.push({
      time: c.time,
      side,
      rMultiple: r * rr,
      riskPercent: risk,
    });
  }

  return trades;
}

export function runBacktest(candles, strategySpec) {
  const trades = generateTradesFromCandles(candles, strategySpec);

  if (trades.length === 0) {
    return {
      trades: [],
      stats: {
        totalTrades: 0,
        winRate: 0,
        avgR: 0,
        equityCurve: [],
      },
    };
  }

  let wins = 0;
  let sumR = 0;
  let equity = 0;
  const equityCurve = [];

  trades.forEach((t, idx) => {
    sumR += t.rMultiple;
    if (t.rMultiple > 0) wins += 1;
    equity += t.rMultiple;
    equityCurve.push({ index: idx, equity });
  });

  return {
    trades,
    stats: {
      totalTrades: trades.length,
      winRate: (wins / trades.length) * 100,
      avgR: sumR / trades.length,
      equityCurve,
    },
  };
}
