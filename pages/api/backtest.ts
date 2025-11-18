import type { NextApiRequest, NextApiResponse } from "next";
import { getOpenAI } from "../../lib/openaiClient";
import { fetchCandlesFromTwelveData } from "../../lib/market";
import type { BacktestRequest, BacktestResponse } from "../../lib/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BacktestResponse | { error: string }>
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const body = req.body as BacktestRequest;

    if (!body.symbol || !body.timeframe || !body.candles || !body.strategyText) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    // Fetch candles from TwelveData
    const interval = body.timeframe; // e.g. "1h", "15min"
    const candles = await fetchCandlesFromTwelveData({
      symbol: body.symbol,
      interval,
      outputSize: Math.min(body.candles, 1500)
    });

    const openai = getOpenAI();

    const prompt = `
You are a strict JSON backtest engine.

The user trades this instrument: "${body.symbol}" on timeframe "${body.timeframe}".
You are given recent OHLC candles from TwelveData and a description of the strategy.

Your job: simulate trades and return a JSON object with this EXACT TypeScript shape:

type BacktestStats = {
  winrate: number;
  rr: number;
  profitFactor: number;
  maxDrawdown: number;
};

type BacktestTrade = {
  id: number;
  direction: "long" | "short";
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  rr: number;
  result: "win" | "loss" | "be";
};

type BacktestResponse = {
  stats: BacktestStats;
  trades: BacktestTrade[];
  equityCurve: { time: string; equity: number }[];
};

Rules:
- Equity starts at 0R.
- rr is the R-multiple of the trade (for example: +2.5, -1, +1, -0.5).
- equityCurve is cumulative equity in R after each trade, with "time" taken from the trade exit time.
- Use the candles realistically to decide entries and exits based on the strategy text.
- DO NOT add explanation, markdown, or commentary. Only return raw JSON.

Strategy description (free text):
${body.strategyText}

Candles (JSON):
${JSON.stringify(candles).slice(0, 12000)}
    `.trim();

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    const raw = completion.output[0].content[0].text;

    let parsed: BacktestResponse;
    try {
      parsed = JSON.parse(raw) as BacktestResponse;
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start === -1 || end === -1) {
        throw new Error("Model did not return JSON");
      }
      const jsonText = raw.slice(start, end + 1);
      parsed = JSON.parse(jsonText) as BacktestResponse;
    }

    res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Backtest API error:", err);
    res.status(500).json({ error: "Backtest failed: " + String(err.message || err) });
  }
}
