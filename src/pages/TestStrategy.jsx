import { useState } from "react";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY
});

async function interpretNotes(text) {
  const prompt = `
  Convert this trading strategy description into structured JSON rules
  for backtesting. Use clear known terminology like:
  "session", "bias", "entry", "indicators", "risk", "filters".
  Text: """${text}"""
  Output JSON only.
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content);
}


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
    notesMode: "N4"
  });

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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

  const [newIndi, setNewIndi] = useState({
    type: "",
    settings: "",
    tf: ""
  });

  const addIndicator = () => {
    if (!newIndi.type) return;
    setForm((prev) => ({
      ...prev,
      indicators: [...prev.indicators, newIndi]
    }));
    setNewIndi({ type: "", settings: "", tf: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Strategy Params:", form);
  };

  return (
    <div className="page page-center">
      <div className="form-card form-animate">
        <h1 className="page-title">Test Strategy</h1>
        <p className="page-subtitle">
          Define your setup, risk parameters and filters.  
          We’ll turn it into structured data for backtesting and discipline tracking.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* MAIN INFO */}
          <div className="field-group">
            <label className="field-label">Instrument</label>
            <input
              type="text"
              placeholder="Ex: EURUSD, NAS100, XAUUSD"
              className="field-input"
              onChange={(e) => update("instrument", e.target.value)}
            />
          </div>

          <div className="field-row-2">
            <div className="field-group">
              <label className="field-label">Session</label>
              <select
                className="field-input"
                onChange={(e) => update("session", e.target.value)}
              >
                <option value="">Select session</option>
                <option>London</option>
                <option>New York</option>
                <option>Asia</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Entry type</label>
              <select
                className="field-input"
                onChange={(e) => update("entryType", e.target.value)}
              >
                <option value="">Select</option>
                <option>Long</option>
                <option>Short</option>
                <option>Both</option>
              </select>
            </div>
          </div>

          <div className="field-row-2">
            <div className="field-group">
              <label className="field-label">Risk % per trade</label>
              <input
                type="number"
                className="field-input"
                placeholder="Ex: 0.8"
                onChange={(e) => update("risk", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label className="field-label">RR target</label>
              <input
                type="number"
                className="field-input"
                placeholder="Ex: 2.5"
                onChange={(e) => update("rr", e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Data range</label>
            <select
              className="field-input"
              onChange={(e) => update("range", e.target.value)}
            >
              <option value="">Select range</option>
              <option>3 Months</option>
              <option>6 Months</option>
              <option>1 Year</option>
              <option>2 Years</option>
            </select>
          </div>

          {/* ENTRY CONDITIONS */}
          <div className="section-divider" />
          <h2 className="section-title">Entry conditions</h2>

          <div className="field-row-2">
            <div className="field-group">
              <label className="field-label">Condition type</label>
              <select
                className="field-input"
                value={newCond.type}
                onChange={(e) =>
                  setNewCond((p) => ({ ...p, type: e.target.value }))
                }
              >
                <option value="">Select type</option>
                <option>FVG</option>
                <option>Liquidity Sweep</option>
                <option>MSS / BOS</option>
                <option>Order Block Retest</option>
                <option>ATR Filter</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Timeframe</label>
              <select
                className="field-input"
                value={newCond.tf}
                onChange={(e) =>
                  setNewCond((p) => ({ ...p, tf: e.target.value }))
                }
              >
                <option value="">Select TF</option>
                <option>1m</option>
                <option>5m</option>
                <option>15m</option>
                <option>1H</option>
                <option>2H</option>
              </select>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Note (optional)</label>
            <input
              className="field-input"
              placeholder="Ex: after sweep of Asian low"
              value={newCond.note}
              onChange={(e) =>
                setNewCond((p) => ({ ...p, note: e.target.value }))
              }
            />
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={addCondition}
          >
            + Add condition
          </button>

          {form.conditions.length > 0 && (
            <div className="list-block">
              {form.conditions.map((c, i) => (
                <div key={i} className="list-item">
                  • {c.type} @ {c.tf} {c.note && `– ${c.note}`}
                </div>
              ))}
            </div>
          )}

          {/* INDICATORS / FILTERS */}
          <div className="section-divider" />
          <h2 className="section-title">Indicators / filters</h2>

          <div className="field-group">
            <label className="field-label">Indicator</label>
            <input
              className="field-input"
              placeholder="Ex: RSI, ATR, MA, News filter..."
              value={newIndi.type}
              onChange={(e) =>
                setNewIndi((p) => ({ ...p, type: e.target.value }))
              }
            />
          </div>

          <div className="field-row-2">
            <div className="field-group">
              <label className="field-label">Settings</label>
              <input
                className="field-input"
                placeholder="Ex: length=14, ATR(20)"
                value={newIndi.settings}
                onChange={(e) =>
                  setNewIndi((p) => ({ ...p, settings: e.target.value }))
                }
              />
            </div>

            <div className="field-group">
              <label className="field-label">Timeframe</label>
              <select
                className="field-input"
                value={newIndi.tf}
                onChange={(e) =>
                  setNewIndi((p) => ({ ...p, tf: e.target.value }))
                }
              >
                <option value="">Select TF</option>
                <option>1m</option>
                <option>5m</option>
                <option>15m</option>
                <option>1H</option>
                <option>4H</option>
                <option>Daily</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={addIndicator}
          >
            + Add indicator
          </button>

          {form.indicators.length > 0 && (
            <div className="list-block">
              {form.indicators.map((ind, i) => (
                <div key={i} className="list-item">
                  • {ind.type}
                  {ind.settings && ` (${ind.settings})`}
                  {ind.tf && ` @ ${ind.tf}`}
                </div>
              ))}
            </div>
          )}
          

          {/* NOTES */}
          <div className="section-divider" />
          <h2 className="section-title">High-level strategy notes</h2>

          <div className="field-group">
            <textarea
              
              rows={4}
              className="field-input"
              placeholder="Describe your high-level rules. Ex: Only trade with Daily + 2H bias. No trades 15m before red news. Continuation days only."
              onChange={(e) => update("notes", e.target.value)}
            />
            <button
  type="button"
  className="btn-secondary"
  style={{ marginTop: "0.5rem" }}
  onClick={async () => {
    const json = await interpretNotes(form.notes);
    console.log("AI RULES:", json);

    // כאן בהמשך נעדכן אוטומטי form.conditions / form.indicators
  }}
>
  Convert notes to rules (AI)
</button>

          </div>

          <button type="submit" className="btn-primary submit-button">
            Start test
          </button>
        </form>
      </div>
    </div>
  );
}
