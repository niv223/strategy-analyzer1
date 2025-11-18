const BASE_URL = "https://api.twelvedata.com/time_series";

if (!process.env.TWELVEDATA_API_KEY) {
  throw new Error("TWELVEDATA_API_KEY is missing in environment variables");
}

export async function fetchOHLC({ symbol, interval, startDate, endDate }) {
  const params = new URLSearchParams({
    symbol,
    interval,
    start_date: startDate,
    end_date: endDate,
    apikey: process.env.TWELVEDATA_API_KEY,
    order: "asc",
    outputsize: "5000",
  });

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`TwelveData error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.status === "error") {
    throw new Error(`TwelveData API error: ${data.message}`);
  }

  return (data.values || []).map((c) => ({
    time: c.datetime,
    open: parseFloat(c.open),
    high: parseFloat(c.high),
    low: parseFloat(c.low),
    close: parseFloat(c.close),
  }));
}
