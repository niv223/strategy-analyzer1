import { NextResponse } from "next/server";
import { openai } from "../../../lib/openai";

export async function POST(req) {
  try {
    const body = await req.json();
    const { notes } = body;

    if (!notes || typeof notes !== "string") {
      return NextResponse.json(
        { error: "Missing 'notes' string in body" },
        { status: 400 }
      );
    }

    const prompt = `
You are a trading strategy parser.
The user gives you free-text notes about a daytrading strategy (ICT/SMC/etc.).
You must return a STRICT JSON object with this EXACT schema:

{
  "direction": "long" | "short" | "both",
  "riskPerTrade": number,
  "rr": number,
  "maxTradesPerDay": number,
  "timeframe": "15min" | "1h" | "4h" | "1day",
  "session": {
    "start": "HH:MM",
    "end": "HH:MM",
    "timezone": "UTC"
  },
  "notes": string
}

Return ONLY valid JSON, no explanation.

User notes:
${notes}
    `.trim();

    const completion = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const raw = completion.output[0].content[0].text;
    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonStart = raw.indexOf("{");
      const jsonEnd = raw.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error("AI did not return JSON");
      }
      const cleaned = raw.slice(jsonStart, jsonEnd + 1);
      parsed = JSON.parse(cleaned);
    }

    return NextResponse.json({ strategy: parsed });
  } catch (err) {
    console.error("Interpret error:", err);
    return NextResponse.json(
      { error: "Failed to interpret notes", details: String(err) },
      { status: 500 }
    );
  }
}
