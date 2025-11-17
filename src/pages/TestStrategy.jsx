import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

export default function TestStrategy() {
  const [form, setForm] = useState({
    instrument: "",
    session: "",
    entryType: "",
    risk: "",
    rr: "",
    range: "",
    conditions: [],
    indicators: [],
    notes: "",
    aiRules: null
  });

  const [newCond, setNewCond] = useState({ type: "", tf: "", note: "" });
  const [newIndi, setNewIndi] = useState({ type: "", settings: "", tf: "" });

  const navigate = useNavigate();
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const addCondition = () => {
    if (!newCond.type || !newCond.tf) return;
    setForm((p) => ({
      ...p,
      conditions: [...p.conditions, newCond],
    }));
    setNewCond({ type: "", tf: "", note: "" });
  };

  const addIndicator = () => {
    if (!newIndi.type) return;
    setForm((p) => ({
      ...p,
      indicators: [...p.indicators, newIndi],
    }));
    setNewIndi({ type: "", settings: "", tf: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      instrument: form.instrument,
      session: form.session,
      entry_type: form.entryType,
      risk: Number(form.risk),
      rr: Number(form.rr),
      range: form.range,
      conditions_json: form.conditions,
      indicators_json: form.indicators,
      notes: form.notes,
      ai_rules: form.aiRules
    };

    console.log("📤 Saving strategy:", payload);

    const { data, error } = await supabase
      .from("strategies")
      .insert(payload)
      .select()
      .single();

    if (error) return console.error("❌ Supabase Error:", error);

    console.log("✅ Saved:", data);
    navigate(`/app/results?id=${data.id}`);
  };

  return (
    <div className="page">
      <h1 className="page-title">Test Strategy</h1>

      <form className="form" onSubmit={handleSubmit}>

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
        </select>

        <select onChange={(e) => update("entryType", e.target.value)}>
          <option value="">Entry Type</option>
          <option>FVG</option>
          <option>Break & Retest</option>
          <option>Liquidity Sweep</option>
        </select>

        <input
          type="number"
          placeholder="Risk % per trade"
          onChange={(e) => update("risk", e.target.value)}
        />

        <input
          type="number"
          placeholder="RR Target"
          onChange={(e) => update("rr", e.target.value)}
        />

        <select onChange={(e) => update("range", e.target.value)}>
          <option value="">Data Range</option>
          <option>1 Month</option>
          <option>3 Months</option>
          <option>6 Months</option>
        </select>

        <h3>Conditions</h3>
        <input
          placeholder="Type"
          value={newCond.type}
          onChange={(e) => setNewCond({ ...newCond, type: e.target.value })}
        />
        <input
          placeholder="TF (ex 15m)"
          value={newCond.tf}
          onChange={(e) => setNewCond({ ...newCond, tf: e.target.value })}
        />
        <input
          placeholder="Note"
          value={newCond.note}
          onChange={(e) => setNewCond({ ...newCond, note: e.target.value })}
        />
        <button type="button" onClick={addCondition}>+ Add Condition</button>

        <h3>Indicators</h3>
        <input
          placeholder="Indicator name"
          value={newIndi.type}
          onChange={(e) => setNewIndi({ ...newIndi, type: e.target.value })}
        />
        <input
          placeholder="Settings"
          value={newIndi.settings}
          onChange={(e) => setNewIndi({ ...newIndi, settings: e.target.value })}
        />
        <input
          placeholder="TF"
          value={newIndi.tf}
          onChange={(e) => setNewIndi({ ...newIndi, tf: e.target.value })}
        />
        <button type="button" onClick={addIndicator}>+ Add Indicator</button>

        <h3>Notes</h3>
        <textarea
          rows={4}
          placeholder="Describe strategy notes..."
          onChange={(e) => update("notes", e.target.value)}
        />

        <button type="submit" className="btn-primary submit-button">
          Start Test
        </button>
      </form>
    </div>
  );
}
