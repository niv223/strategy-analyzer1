import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

export default function Results() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("backtests")
        .select("id, instrument, session_text, results, inserted_at")
        .order("inserted_at", { ascending: false })
        .limit(50);
      if (error) {
        console.error(error);
      } else {
        setRows(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Results</h1>
      <p className="page-sub">Full list of stored backtests.</p>

      <div className="card table-card">
        {loading ? (
          <p className="status-text">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="status-text">No results yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Instrument</th>
                <th>Session</th>
                <th>Trades</th>
                <th>Winrate</th>
                <th>Profit %</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const summary = r.results?.summary || {};
                return (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{r.instrument}</td>
                    <td>{r.session_text}</td>
                    <td>{summary.trades ?? "-"}</td>
                    <td>
                      {summary.winrate != null
                        ? (summary.winrate * 100).toFixed(1)
                        : "-"}
                    </td>
                    <td>
                      {summary.profit_pct != null
                        ? summary.profit_pct.toFixed(1)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
