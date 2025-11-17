import { useState } from "react";

export default function TestStrategy() {
  const [form, setForm] = useState({
    instrument: "",
    session: "",
    entryType: "",
    risk: "",
    rr: "",
    range: "",
    conditions: []
  });

  const update = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // temp state to add rule
  const [newCond, setNewCond] = useState({
    type: "",
    tf: "",
    note: ""
  });

  const addCondition = () => {
    if (!newCond.type || !newCond.tf) return;
    setForm((prev) => ({
      ...prev,
      conditions: [...prev.conditions, newCond]
    }));
    setNewCond({ type: "", tf: "", note: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Strategy Params:", form);
  };

  return (
    <div>
      <h1>Test Strategy</h1>

      {/* MAIN PARAMS FORM */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", maxWidth: "380px" }}>
        
        <select onChange={(e) => update("instrument", e.target.value)}>
          <option value="">Instrument</option>
          <option>EURUSD</option>
          <option>GBPUSD</option>
          <option>XAUUSD</option>
          <option>US100</option>
        </select>

        <select onChange={(e) => update("session", e.target.value)}>
          <option value="">Session</option>
          <option>London</option>
          <option>New York</option>
          <option>Asia</option>
        </select>

        <select onChange={(e) => update("entryType", e.target.value)}>
          <option value="">Entry Type</option>
          <option>Long</option>
          <option>Short</option>
          <option>Both</option>
        </select>

        <input
          type="number"
          placeholder="Risk % per trade"
          onChange={(e) => update("risk", e.target.value)}
        />

        <input
          type="number"
          placeholder="RR Target (ex: 2.5)"
          onChange={(e) => update("rr", e.target.value)}
        />

        <select onChange={(e) => update("range", e.target.value)}>
          <option value="">Data Range</option>
          <option>3 Months</option>
          <option>6 Months</option>
          <option>1 Year</option>
          <option>2 Years</option>
        </select>

        {/* ENTRY CONDITIONS BUILDER */}
        <h3>Entry Conditions</h3>

        <select value={newCond.type} onChange={(e) => setNewCond((p) => ({ ...p, type: e.target.value }))}>
          <option value="">Condition Type</option>
          <option>FVG</option>
          <option>Liquidity Sweep</option>
          <option>MSS / BOS</option>
          <option>Order Block Retest</option>
          <option>ATR Filter</option>
        </select>

        <select value={newCond.tf} onChange={(e) => setNewCond((p) => ({ ...p, tf: e.target.value }))}>
          <option value="">Timeframe</option>
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
          <option>1H</option>
          <option>2H</option>
        </select>

        <input
          placeholder="Note (optional)"
          value={newCond.note}
          onChange={(e) => setNewCond((p) => ({ ...p, note: e.target.value }))}
        />

        <button type="button" onClick={addCondition}>+ Add Condition</button>

        {/* VIEW CONDITIONS */}
        {form.conditions.length > 0 && (
          <ul>
            {form.conditions.map((c, i) => (
              <li key={i}>
                {c.type} @ {c.tf} {c.note && `- ${c.note}`}
              </li>
            ))}
          </ul>
        )}

        <button type="submit">Start Test</button>
      </form>

    </div>
  );
}
