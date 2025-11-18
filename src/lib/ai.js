export async function interpretNotesWithAI(notes) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("VITE_OPENAI_API_KEY is missing – returning empty rules.");
    return { rules: [], filters: [] };
  }

  const prompt = `
Convert this trading strategy description into structured JSON rules for backtesting.
Use keys: session, bias, entry, risk, filters, invalid_setups. Text: """${notes}""".
Output JSON only.
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    if (!res.ok) {
      console.error("AI error", await res.text());
      return { rules: [], filters: [] };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    return JSON.parse(content);
  } catch (err) {
    console.error("AI exception", err);
    return { rules: [], filters: [] };
  }
}
