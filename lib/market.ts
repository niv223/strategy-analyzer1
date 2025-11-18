const BASE_URL = "https://api.twelvedata.com/time_series";

export async function fetchCandlesFromTwelveData(params: {
  symbol: string;
  interval: string;
  outputSize: number;
}) {
  const apiKey = process.env.TWELVEDATA_API_KEY;
  if (!apiKey) {
    throw new Error("TWELVEDATA_API_KEY is missing in environment variables");
  }

  const search = new URLSearchParams({
    symbol: params.symbol,
    interval: params.interval,
    outputsize: String(params.outputSize),
    apikey: apiKey,
    order: "asc"
  });

  const url = `${BASE_URL}?${search.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`TwelveData HTTP error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status === "error") {
    throw new Error(`TwelveData API error: ${data.message}`);
  }

  // Normalize candles
  const values = Array.isArray(data.values) ? data.values : [];
  return values.map((c: any) => ({
    time: c.datetime,
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close)
  }));
}
