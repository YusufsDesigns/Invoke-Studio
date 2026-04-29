// Run: npx tsx scripts/agent-demo.ts
//
// All config is read from .env.local automatically.
// To use a different tool or inputs, override at the command line:
//   DEMO_TOOL_ID=xxx npx tsx scripts/agent-demo.ts
//   DEMO_INPUTS_JSON='{"field_abc":"value"}' npx tsx scripts/agent-demo.ts

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local (only sets vars that aren't already set in the environment)
try {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    const val = t.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // .env.local not found — rely on real environment variables
}

const LOCUS_KEY   = process.env.LOCUS_API_KEY!;           // from .env.local
const LOCUS_BASE  = process.env.LOCUS_API_BASE ?? "https://beta-api.paywithlocus.com/api";
const BASE_URL    = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
const TOOL_ID     = process.env.DEMO_TOOL_ID!;             // add to .env.local
const INPUTS_JSON = process.env.DEMO_INPUTS_JSON ?? "{}";  // add to .env.local

if (!LOCUS_KEY) throw new Error("LOCUS_API_KEY is missing from .env.local");
if (!TOOL_ID)   throw new Error("DEMO_TOOL_ID is missing from .env.local");

async function api(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${url} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function locus(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${LOCUS_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${LOCUS_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Locus ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function poll<T>(
  fn: () => Promise<T>,
  done: (v: T) => boolean,
  ms = 2000,
  max = 40
): Promise<T> {
  for (let i = 0; i < max; i++) {
    const v = await fn();
    if (done(v)) return v;
    await new Promise((r) => setTimeout(r, ms));
    process.stdout.write(".");
  }
  throw new Error("Polling timed out after " + (max * ms / 1000) + "s");
}

async function main() {
  console.log("\n🤖  Invoke Studio — Autonomous Agent Demo\n");
  console.log("Demonstrates an agent discovering, paying for, and receiving");
  console.log("results from a tool — with zero human interaction.\n");

  // Step 0: Discover the tool schema
  console.log("0/4  Fetching tool schema...");
  const tool = await api(`${BASE_URL}/api/tools/${TOOL_ID}`);
  console.log(`     ✓  Tool:   ${tool.name}`);
  console.log(`     ✓  Price:  $${tool.priceUsdc.toFixed(2)} USDC/run`);

  type FieldSchema = { id: string; label: string; type: string; required: boolean };
  const schema = tool.inputSchema as FieldSchema[];
  console.log(`     ✓  Fields:`);
  schema.forEach((f: FieldSchema) => {
    console.log(`           ${f.required ? "*" : " "} ${f.id}  (${f.label})`);
  });

  // Build inputs: use INPUTS_JSON if provided, fall back to placeholder values
  const providedInputs = JSON.parse(INPUTS_JSON) as Record<string, string>;
  const inputs: Record<string, string> = {};
  for (const field of schema) {
    inputs[field.id] = providedInputs[field.id] ?? `[Demo: ${field.label}]`;
  }

  const usingPlaceholders = schema.some(
    (f: FieldSchema) => inputs[f.id].startsWith("[Demo:")
  );
  if (usingPlaceholders) {
    console.log("\n     ⚠  Using placeholder values. For real inputs set:");
    console.log(`        INPUTS_JSON='${JSON.stringify(
      Object.fromEntries(schema.map((f: FieldSchema) => [f.id, `<${f.label}>`]))
    )}'\n`);
  }

  // Step 1: Create run (gets a Locus checkout session)
  console.log("1/4  Creating run...");
  const run = await api(`${BASE_URL}/api/tools/${TOOL_ID}/run`, "POST", { inputs });
  console.log(`     ✓  Run:     ${run.runId}`);
  console.log(`     ✓  Session: ${run.sessionId}`);

  // Step 2: Preflight — verify agent wallet can cover the cost
  console.log("2/4  Preflight check...");
  const preflight = await locus(`/checkout/agent/preflight/${run.sessionId}`);
  // Locus returns flat { canPay, agent, session } (not nested under data)
  const canPay = preflight.canPay ?? preflight.data?.canPay;
  if (!canPay) {
    const blockers = preflight.blockers ?? preflight.data?.blockers;
    throw new Error(
      `Cannot pay.\n     Blockers: ${JSON.stringify(blockers)}\n     Full response: ${JSON.stringify(preflight)}`
    );
  }
  const balance = preflight.agent?.availableBalance ?? preflight.data?.agent?.availableBalance;
  console.log(`     ✓  Balance: ${balance} USDC`);

  // Step 3: Pay — Locus debits the agent wallet and triggers the webhook automatically
  console.log("3/4  Paying...");
  const payment = await locus(`/checkout/agent/pay/${run.sessionId}`, "POST");
  // Response may be flat or nested under data
  const txId = payment.transactionId ?? payment.data?.transactionId;
  if (!txId) throw new Error(`No transactionId in pay response: ${JSON.stringify(payment)}`);
  console.log(`     ✓  TX: ${txId}`);
  console.log(`     →  Locus will fire the webhook and trigger AI execution.`);

  // Step 4: Poll our own run API — webhook marks run PAID, AI runs, then COMPLETED
  process.stdout.write("4/4  Waiting for AI result");
  const result = await poll<{ status: string; result?: string }>(
    () => fetch(`${BASE_URL}/api/runs/${run.runId}`).then((r) => r.json()),
    (r) => ["COMPLETED", "FAILED"].includes(r.status)
  );
  console.log(" ✓\n");

  if (result.status === "FAILED") throw new Error("Tool execution failed");

  console.log("═".repeat(60));
  console.log("RESULT");
  console.log("═".repeat(60));
  console.log(result.result);
  console.log("═".repeat(60));
  console.log("\n✅  Full agent payment loop complete. Zero human intervention.\n");
}

main().catch((err) => {
  console.error("\n❌  " + err.message);
  process.exit(1);
});
