// Connectivity/availability smoke test for the third-party services PokeTrade's
// BRD actually uses (LLM providers + TCGdex catalog). Run: npm run smoke

const results = [];

async function check(name, fn) {
  const start = Date.now();
  try {
    const detail = await fn();
    results.push({ name, ok: true, ms: Date.now() - start, detail });
  } catch (err) {
    results.push({ name, ok: false, ms: Date.now() - start, detail: err.message });
  }
}

await check("OpenAI (api.openai.com)", async () => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const base = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const res = await fetch(`${base}/models`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return `${body.data?.length ?? 0} models visible`;
});

await check("DashScope compatible-mode (dashscope.aliyuncs.com)", async () => {
  const key = process.env.DASHSCOPE_API_KEY;
  if (!key) throw new Error("DASHSCOPE_API_KEY missing");
  const base = "https://dashscope.aliyuncs.com/compatible-mode/v1";
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "qwen-turbo",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return "chat/completions reachable";
});

await check("TCGdex catalog (api.tcgdex.net)", async () => {
  const res = await fetch("https://api.tcgdex.net/v2/en/cards?name=Pikachu");
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return `${Array.isArray(body) ? body.length : 0} cards found`;
});

let allOk = true;
for (const r of results) {
  allOk &&= r.ok;
  const status = r.ok ? "OK  " : "FAIL";
  console.log(`[${status}] ${r.name} (${r.ms}ms) — ${r.detail}`);
}

if (!allOk) process.exit(1);
