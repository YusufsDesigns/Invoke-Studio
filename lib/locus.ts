import crypto from "crypto";

const LOCUS_KEY = process.env.LOCUS_API_KEY!;
const LOCUS_BASE = process.env.LOCUS_API_BASE!;

export async function createCheckoutSession(params: {
  toolId: string;
  toolSlug: string;
  runId: string;
  toolName: string;
  priceUsdc: number;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  const res = await fetch(`${LOCUS_BASE}/checkout/sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOCUS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: params.priceUsdc.toFixed(2),
      description: `${params.toolName} - 1 run`,
      successUrl: `${baseUrl}/marketplace/${params.toolSlug}?run=${params.runId}`,
      cancelUrl: `${baseUrl}/marketplace/${params.toolSlug}`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`,
      metadata: { runId: params.runId, toolId: params.toolId },
    }),
  });

  if (!res.ok) throw new Error(`Locus session creation failed: ${await res.text()}`);
  const data = await res.json();

  return {
    sessionId: data.data.id,
    checkoutUrl: data.data.checkoutUrl ?? "",
    webhookSecret: data.data.webhookSecret ?? "",
    expiresAt: data.data.expiresAt,
  };
}

export async function executeToolWithClaude(params: {
  systemPrompt: string;
  userInput: string;
}): Promise<string> {
  const res = await fetch(`${LOCUS_BASE}/wrapped/anthropic/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOCUS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: 2000,
      system: params.systemPrompt,
      messages: [{ role: "user", content: params.userInput }],
    }),
  });
  if (!res.ok) throw new Error(`Locus Anthropic error: ${await res.text()}`);
  const data = await res.json();
  const content = data?.data?.content?.[0]?.text;
  if (!content) throw new Error("Empty AI response");
  return content;
}

export async function sendCreatorPayout(params: {
  payoutEmail: string;
  amountUsdc: number;
  creatorName: string;
}): Promise<string> {
  const res = await fetch(`${LOCUS_BASE}/pay/send-email`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOCUS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.payoutEmail,
      amount: params.amountUsdc,
      memo: `Invoke Studio earnings — ${params.creatorName}`,
      expires_in_days: 30,
    }),
  });
  if (!res.ok) throw new Error(`Locus payout error: ${await res.text()}`);
  const data = await res.json();
  return data.data.transaction_id;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) return true;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}
