export type BacktestRequest = {
  symbol: string;
  timeframe: string;
  candles: number;
  strategyText: string;
};

export type BacktestStats = {
  winrate: number;
  rr: number;
  profitFactor: number;
  maxDrawdown: number;
};

export type BacktestTrade = {
  id: number;
  direction: "long" | "short";
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  rr: number;
  result: "win" | "loss" | "be";
};

export type EquityPoint = {
  time: string;
  equity: number;
};

export type BacktestResponse = {
  stats: BacktestStats;
  trades: BacktestTrade[];
  equityCurve: EquityPoint[];
};
