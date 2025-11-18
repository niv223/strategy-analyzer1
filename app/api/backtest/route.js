import { NextResponse } from "next/server";
import { fetchOHLC } from "../../../lib/twelvedata";
import { runBacktest } from "../../../lib/backtest";

export async function POST(req) {
  try {
    const body = await req.json();
    const { strategy, symbol, from, to } = body;

    if (!strategy || !symbol || !from || !to) {
      return NextResponse.json(
        { error: "Missing strategy, symbol, from, or to" },
        { status: 400 }
      );
    }

    const intervalMap = {
      "15min": "15min",
      "1h": "1h",
      "4h": "4h",
      "1day": "1day",
    };

    const interval = intervalMap[strategy.timeframe] || "1h";

    const candles = await fetchOHLC({
      symbol,
      interval,
      startDate: from,
      endDate: to,
    });

    if (!candles.length) {
      return NextResponse.json(
        { error: "No candles returned for given symbol/date" },
        { status: 400 }
      );
    }

    const result = runBacktest(candles, strategy);

    return NextResponse.json({
      symbol,
      from,
      to,
      strategy,
      ...result,
    });
  } catch (err) {
    console.error("Backtest error:", err);
    return NextResponse.json(
      { error: "Failed to run backtest", details: String(err) },
      { status: 500 }
    );
  }
}
