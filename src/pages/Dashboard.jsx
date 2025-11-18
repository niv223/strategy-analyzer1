import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("backtests")
        .select("id, instrument, session_text, winrate, avg_rr, profit_factor, inserted_at")
        .order("inserted_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error(error);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const avg = (key) => {
    if (!rows.length) return "-";
    const val = rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / rows.length;
    return val.toFixed(2);
  };

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Quick view of your strategy performance over time.</p>

      <div className="grid three">
        <div className="stat-card">
          <div className="stat-label">Avg winrate</div>
          <div className="stat-value">{avg("winrate")}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg RR</div>
          <div className="stat-value">{avg("avg_rr")}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg profit factor</div>
          <div className="stat-value">{avg("profit_factor")}</div>
        </div>
      </div>

      <div className="card table-card">
        <h2 className="section-title">Recent backtests</h2>
        {loading ? (
          <p className="status-text">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="status-text">No backtests yet. Run your first one!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Instrument</th>
                <th>Session</th>
                <th>Winrate</th>
                <th>Avg RR</th>
                <th>Profit factor</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.instrument}</td>
                  <td>{r.session_text}</td>
                  <td>{r.winrate ?? "-"}</td>
                  <td>{r.avg_rr ?? "-"}</td>
                  <td>{r.profit_factor ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
