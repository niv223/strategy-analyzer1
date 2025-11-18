import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function TestStrategy() {
  const [form, setForm] = useState({
    instrument: "",
    session: "",
    entry_type: "",
    risk: "",
    rr: "",
    notes: ""
  });

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const saveBacktest = async () => {
    const { data, error } = await supabase
      .from("backtests")
      .insert([form]);

    if (error) {
      console.error("❌ Error saving:", error);
      alert("Error saving. Check console.");
    } else {
      console.log("✅ Saved:", data);
      alert("Saved successfully!");
    }
  };

  return (
    <div className="page">
      <h1>Test Strategy</h1>

      <div className="field-group">
        <label>Instrument</label>
        <input
          className="field-input"
          onChange={(e) => update("instrument", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>Session</label>
        <input
          className="field-input"
          onChange={(e) => update("session", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>Entry Type</label>
        <input
          className="field-input"
          onChange={(e) => update("entry_type", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>Risk %</label>
        <input
          type="number"
          className="field-input"
          onChange={(e) => update("risk", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>RR</label>
        <input
          type="number"
          className="field-input"
          onChange={(e) => update("rr", e.target.value)}
        />
      </div>

      <div className="field-group">
        <label>Notes</label>
        <textarea
          rows={4}
          className="field-input"
          placeholder="Describe your strategy notes..."
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      <button className="btn-primary" onClick={saveBacktest}>
        💾 Save Test
      </button>
    </div>
  );
}
