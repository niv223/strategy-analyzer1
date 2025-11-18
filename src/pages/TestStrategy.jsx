import React, { useState } from "react";
import { supabase } from "../lib/supabase.js";
import { interpretNotesWithAI } from "../lib/ai.js";
import { runBacktestLocally } from "../lib/backtest.js";

const emptyForm = {
  instrument: "",
  session: "",
  entry_type: "",
  risk: "",
  rr: "",
  range: "",
  notes: "",
};

export default function TestStrategy() {
  const [form, setForm] = useState(emptyForm);
  const [conditions, setConditions] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [aiRules, setAiRules] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const update = (key, value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const [newCond, setNewCond] = useState({ type: "", tf: "", note: "" });
  const [newIndi, setNewIndi] = useState({ type: "", tf: "", settings: "" });

  const addCondition = () => {
    if (!newCond.type || !newCond.tf) return;
    setConditions((prev) => [...prev, newCond]);
    setNewCond({ type: "", tf: "", note: "" });
  };

  const addIndicator = () => {
    if (!newIndi.type || !newIndi.tf) return;
    setIndicators((prev) => [...prev, newIndi]);
    setNewIndi({ type: "", tf: "", settings: "" });
  };

  const handleAI = async () => {
    if (!form.notes) return;
    setMessage("Interpreting notes with AI...");
    const rules = await interpretNotesWithAI(form.notes);
    setAiRules(rules);
    setMessage("AI rules generated (see console).");
    console.log("AI RULES", rules);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("Running local backtest + saving to Supabase...");

    const backtest = runBacktestLocally(form, aiRules);

    try {
      const { data, error } = await supabase.from("backtests").insert({
        instrument: form.instrument,
        session_text: form.session,
        entry_type: form.entry_type,
        risk: form.risk,
        rr: form.rr,
        date_range: form.range,
        conditions,
        indicators,
        notes_text: form.notes,
        ai_rules: aiRules,
        results: backtest,
      }).select().single();

      if (error) throw error;
      setMessage("Saved backtest " + data.id);
      setForm(emptyForm);
      setConditions([]);
      setIndicators([]);
      setAiRules(null);
    } catch (err) {
      console.error(err);
      setMessage("Error saving backtest: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Test Strategy</h1>
      <p className="page-sub">
        Define your rules once, let the engine run thousands of trades for you.
      </p>

      <form className="card" onSubmit={handleSubmit}>
        <h2 className="section-title">Core settings</h2>
        <div className="grid two">
          <div className="field">
            <label>Instrument</label>
            <input
              className="field-input"
              placeholder="ex: EURUSD"
              value={form.instrument}
              onChange={(e) => update("instrument", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Session</label>
            <input
              className="field-input"
              placeholder="ex: London, NY, Asia"
              value={form.session}
              onChange={(e) => update("session", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Entry type</label>
            <input
              className="field-input"
              placeholder="ex: FVG + MSS"
              value={form.entry_type}
              onChange={(e) => update("entry_type", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Risk % per trade</label>
            <input
              className="field-input"
              type="number"
              min="0"
              step="0.1"
              value={form.risk}
              onChange={(e) => update("risk", e.target.value)}
            />
          </div>
          <div className="field">
            <label>RR target</label>
            <input
              className="field-input"
              type="number"
              min="0"
              step="0.1"
              value={form.rr}
              onChange={(e) => update("rr", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Data range</label>
            <input
              className="field-input"
              placeholder="ex: last 2 years"
              value={form.range}
              onChange={(e) => update("range", e.target.value)}
            />
          </div>
        </div>

        <h2 className="section-title">Conditions</h2>
        <div className="grid three">
          <div className="field">
            <label>Type</label>
            <input
              className="field-input"
              placeholder="structure / MSS / BOS"
              value={newCond.type}
              onChange={(e) => setNewCond({ ...newCond, type: e.target.value })}
            />
          </div>
          <div className="field">
            <label>TF</label>
            <input
              className="field-input"
              placeholder="ex: 15m"
              value={newCond.tf}
              onChange={(e) => setNewCond({ ...newCond, tf: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Note</label>
            <input
              className="field-input"
              placeholder="optional"
              value={newCond.note}
              onChange={(e) => setNewCond({ ...newCond, note: e.target.value })}
            />
          </div>
        </div>
        <button type="button" className="secondary-btn" onClick={addCondition}>
          + Add condition
        </button>

        {conditions.length > 0 && (
          <ul className="pill-list">
            {conditions.map((c, i) => (
              <li key={i} className="pill">
                {c.type} · {c.tf} {c.note && `· ${c.note}`}
              </li>
            ))}
          </ul>
        )}

        <h2 className="section-title">Indicators</h2>
        <div className="grid three">
          <div className="field">
            <label>Type</label>
            <input
              className="field-input"
              placeholder="ex: EMA 50"
              value={newIndi.type}
              onChange={(e) => setNewIndi({ ...newIndi, type: e.target.value })}
            />
          </div>
          <div className="field">
            <label>TF</label>
            <input
              className="field-input"
              placeholder="ex: 15m"
              value={newIndi.tf}
              onChange={(e) => setNewIndi({ ...newIndi, tf: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Settings</label>
            <input
              className="field-input"
              placeholder="ex: 50, close"
              value={newIndi.settings}
              onChange={(e) =>
                setNewIndi({ ...newIndi, settings: e.target.value })
              }
            />
          </div>
        </div>
        <button type="button" className="secondary-btn" onClick={addIndicator}>
          + Add indicator
        </button>

        {indicators.length > 0 && (
          <ul className="pill-list">
            {indicators.map((ind, i) => (
              <li key={i} className="pill">
                {ind.type} · {ind.tf} {ind.settings && `· ${ind.settings}`}
              </li>
            ))}
          </ul>
        )}

        <h2 className="section-title">High-level notes</h2>
        <div className="field">
          <label>Describe your strategy</label>
          <textarea
            className="field-input"
            rows={4}
            placeholder="Describe bias, sessions, invalid days, risk filters, news filters..."
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>

        <div className="actions-row">
          <button type="button" className="secondary-btn" onClick={handleAI}>
            Convert notes to rules (AI)
          </button>
          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Running..." : "Run backtest & save"}
          </button>
        </div>

        {message && <p className="status-text">{message}</p>}
      </form>
    </div>
  );
}
