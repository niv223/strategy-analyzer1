export type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

type FetchCandlesParams = {
  symbol: string;
  interval: string;
  outputSize: number;
};

const BASE_URL = "https://api.twelvedata.com/time_series";

export async function fetchCandlesFromTwelveData(
  params: FetchCandlesParams
): Promise<Candle[]> {
  const { symbol, interval, outputSize } = params;
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) throw new Error("Missing TWELVEDATA_API_KEY environment variable");

  const url = `${BASE_URL}?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputSize}&apikey=${encodeURIComponent(apiKey)}&format=JSON`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch candles: ${res.status} ${res.statusText}`);

  const data = await res.json();
  if (!data.values || !Array.isArray(data.values)) {
    throw new Error("Unexpected TwelveData response format");
  }

  const candles: Candle[] = data.values.map((v: any) => ({
    time: v.datetime || v.time,
    open: parseFloat(v.open),
    high: parseFloat(v.high),
    low: parseFloat(v.low),
    close: parseFloat(v.close),
    volume: v.volume ? parseFloat(v.volume) : undefined
  }));

  return candles.reverse();
}
