@AGENTS.md

# INVOKE STUDIO — CLAUDE.md
> The marketplace for AI-powered tools. Pay per run. Built for humans and agents.

---

## STEP 0 — READ THESE BEFORE WRITING A SINGLE LINE OF CODE

```bash
cat ~/.claude/skills/impeccable/SKILL.md
cat ~/.claude/skills/taste-skill/SKILL.md
cat ~/.claude/skills/emilkowalski/SKILL.md
```

Design reference image — study the layout, card design, typography, and spacing:
```
https://cdn.dribbble.com/userupload/17770328/file/original-5a1fd4a8fc17cd2a90c9a79a5466cab2.jpg
```

Also check if there is a `logo.png` or `references/` folder in the project root. If present, use the logo everywhere and study the reference images for each page.

These define the visual bar. Everything built must meet or exceed that quality. Light theme throughout — the BeamsBackground hero is the only dark section.

---

## WHAT WE'RE BUILDING

**Invoke Studio** is a pay-per-run AI tools marketplace.

**Three roles:**

**Tool Creators** — developers, consultants, prompt engineers — publish AI-powered tools. A tool is: a name, description, a hidden system prompt (their expertise), a custom input form they define, and a USDC price per run. Creating tools is completely free.

**Buyers** — anyone who needs the tool's output — find a tool, fill in the input form, pay once in USDC via Locus Checkout, and get the AI-generated result instantly. No account required to buy.

**AI Agents** — autonomous programs that need AI capabilities — call the same run API that humans use, pay via Locus's agent payment API (preflight → pay → poll), and receive the result programmatically. No human in the loop.

**The platform (Invoke Studio)** earns 20% on every run. 80% accumulates in the creator's balance on their dashboard. Creators withdraw to their email whenever they want — Locus sends USDC via escrow, no prior crypto account needed.

**The full Locus loop in one platform:**
- Locus Checkout — collect payment from buyer
- Locus Wrapped Anthropic API — execute the AI tool (no separate Anthropic key needed)
- Pay With Locus send-email — send creator their earnings on withdrawal

---

## WHAT TOOLS CAN BE CREATED

This is the brand identity. Be explicit about constraints in the UI.

**What a tool is:** The creator writes a system prompt that makes Claude behave as a specialist. The creator also defines the input form — exactly what fields buyers fill in. When a buyer pays, their input + the system prompt are sent to Claude via the Locus Wrapped Anthropic API. Claude returns a structured result. The buyer never sees the system prompt.

**What makes a tool worth paying for:**
1. The system prompt is expert-level — specific, structured, non-obvious. Not something a user would write themselves.
2. The input form is carefully designed — the creator has figured out exactly what Claude needs to produce a great answer.
3. The output is immediately usable — a ready-to-send email, a structured report, working code, a formatted document.

**Supported categories and example tools:**

WRITING & COMMUNICATION
- Investor Update Email Writer — inputs: metrics, wins, blockers, ask. Output: polished investor update ready to send. $0.35
- Performance Review Writer — inputs: employee role, projects, wins, growth areas, honest notes. Output: professional review text. $0.40
- Grant Application Writer — inputs: project description, outcomes, budget justification. Output: structured grant section. $0.60

LEGAL & COMPLIANCE (high perceived value — professional alternatives are expensive)
- Contract Risk Scanner — input: paste contract text. Output: red flags, missing protections, negotiation points. $0.75
- NDA Analyzer — paste NDA text, get flagged non-standard clauses in plain language. $0.60
- Terms of Service Summarizer — paste TOS, get plain-language explanation of what you're agreeing to. $0.40
- Privacy Policy Gap Finder — paste your policy, get what's missing vs GDPR/CCPA. $0.65

CODE & DEVELOPMENT (focused, specific code tasks — NOT full repo reviews)
- Security Code Audit — paste a specific function/module, get vulnerabilities ranked by severity with patched versions. $0.65
- Database Schema Reviewer — paste Prisma schema or SQL DDL, get normalization issues, missing indexes, N+1 risks. $0.60
- API Error Debugger — paste the error, request code, and expected behavior. Output: diagnosis and working fix. $0.40
- PR Description Generator — describe your changes, get a structured PR description. $0.20
- Code Explainer for Non-Devs — paste code, get plain-English explanation for stakeholders. $0.25

BUSINESS & STRATEGY
- Startup Pitch Critiquer — inputs: one-liner, problem, solution, traction, ask. Output: investor-level critique with specific pushback questions and suggested answers. $0.75
- Pricing Strategy Analyzer — inputs: product, costs, competitors, differentiation. Output: pricing recommendation with reasoning. $0.60
- OKR Generator — inputs: company mission, quarter priorities. Output: structured OKRs with measurable key results. $0.35
- Competitor Teardown — inputs: your product, competitor, known info. Output: SWOT comparison, positioning gaps, attack vectors. $0.65

RESEARCH & ANALYSIS
- Business Idea Validator — inputs: idea, target user, problem, revenue model. Output: market assessment, competition, biggest risk, critical unanswered question. $0.50
- Survey Question Designer — input: what you want to learn from users. Output: 10 well-designed questions with explanations. $0.35

FINANCE
- Unit Economics Analyzer — inputs: CAC, LTV, churn, margins, business model. Output: health diagnosis, key ratios vs benchmarks, what to fix and in what order. $0.65
- Financial Statement Red Flag Scanner — paste P&L or balance sheet data. Output: health indicators, danger zones, key ratios in plain language. $0.75

**CONSTRAINTS — show this clearly on the Create Tool page:**
- Text input only — no file uploads, no image input (MVP)
- No live web data or real-time search
- No code execution — tools can generate code, not run it
- No memory between runs — each run is fully independent
- No multi-step workflows within a single run
- Each textarea has a creator-set character limit (typically 500–8000 chars)

---

## TECH STACK

- Framework: Next.js 16 (App Router, TypeScript strict mode)
- Styling: Tailwind CSS v4 + shadcn/ui
- Database: Neon Postgres via Vercel integration
- ORM: Prisma 6
- Auth: Auth.js v5 (next-auth@latest) — GitHub OAuth only
- Payments: locus-agent-sdk (server) + @withlocus/checkout-react (client)
- AI Execution: Locus Wrapped Anthropic API — NO separate Anthropic key needed
- Animation: motion (framer-motion v11+)
- Deployment: Vercel

---

## ENVIRONMENT VARIABLES

.env.local:
```
AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
NEXTAUTH_URL=http://localhost:3000

DATABASE_URL=

LOCUS_API_KEY=claw_dev_ESf1D6RtPCzZZDZx6oq_r7DnuXQ7_D98
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api

NEXT_PUBLIC_URL=http://localhost:3000
```

---

## INSTALL DEPENDENCIES

Next.js 16 is already scaffolded and set up. Do NOT run create-next-app. Just install the remaining dependencies:

```bash
npx shadcn@latest init
npm install @withlocus/checkout-react
npm install motion
npm install @prisma/client prisma
npm install next-auth@latest @auth/prisma-adapter
npm install lucide-react zod
```

---

## COPY THIS FILE TO components/ui/beams-background.tsx

```tsx
"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number; y: number; width: number; length: number;
  angle: number; speed: number; opacity: number;
  hue: number; pulse: number; pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10;
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({ className, intensity = "strong", children }: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beamsRef = useRef<Beam[]>([]);
  const animationFrameRef = useRef<number>(0);
  const opacityMap = { subtle: 0.7, medium: 0.85, strong: 1 };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      beamsRef.current = Array.from({ length: 30 }, () => createBeam(canvas.width, canvas.height));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      if (!canvas) return beam;
      const column = index % 3;
      const spacing = canvas.width / 3;
      beam.y = canvas.height + 100;
      beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = 190 + (index * 70) / totalBeams;
      beam.opacity = 0.2 + Math.random() * 0.1;
      return beam;
    }

    function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate((beam.angle * Math.PI) / 180);
      const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];
      const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
      gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
      gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      ctx.restore();
    }

    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "blur(35px)";
      const totalBeams = beamsRef.current.length;
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, index, totalBeams);
        drawBeam(ctx, beam);
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [intensity]);

  return (
    <div className={cn("relative w-full overflow-hidden bg-neutral-950", className)}>
      <canvas ref={canvasRef} className="absolute inset-0" style={{ filter: "blur(15px)" }} />
      <motion.div
        className="absolute inset-0 bg-neutral-950/5"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
        style={{ backdropFilter: "blur(50px)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
```

---

## DATABASE SCHEMA

prisma/schema.prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String?
  image        String?
  githubId     String?  @unique
  payoutEmail  String?
  createdAt    DateTime @default(now())

  accounts     Account[]
  sessions     Session[]
  tools        Tool[]
  earnings     Earning[]
  withdrawals  Withdrawal[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Tool {
  id            String       @id @default(cuid())
  creatorId     String
  name          String
  slug          String       @unique
  description   String       @db.Text
  category      ToolCategory
  systemPrompt  String       @db.Text
  inputSchema   Json
  // inputSchema is Array<{
  //   id: string            — key used in inputData on Run
  //   label: string         — shown above the field to buyers
  //   type: "text"|"textarea"
  //   placeholder: string
  //   charLimit?: number    — textarea only
  //   required: boolean
  // }>
  priceUsdc     Float
  isPublished   Boolean      @default(false)
  runCount      Int          @default(0)
  exampleOutput String?      @db.Text
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  creator       User         @relation(fields: [creatorId], references: [id])
  runs          Run[]
}

enum ToolCategory {
  WRITING
  LEGAL
  CODE
  BUSINESS
  RESEARCH
  FINANCE
}

model Run {
  id              String    @id @default(cuid())
  toolId          String
  locusSessionId  String    @unique
  webhookSecret   String    @db.Text
  inputData       Json
  result          String?   @db.Text
  status          RunStatus @default(PENDING)
  payerAddress    String?
  txHash          String?
  createdAt       DateTime  @default(now())
  completedAt     DateTime?

  tool            Tool      @relation(fields: [toolId], references: [id])
  earning         Earning?
}

enum RunStatus {
  PENDING
  PAID
  COMPLETED
  FAILED
}

model Earning {
  id           String        @id @default(cuid())
  creatorId    String
  runId        String        @unique
  amountUsdc   Float
  status       EarningStatus @default(PENDING)
  withdrawalId String?
  createdAt    DateTime      @default(now())

  creator      User          @relation(fields: [creatorId], references: [id])
  run          Run           @relation(fields: [runId], references: [id])
  withdrawal   Withdrawal?   @relation(fields: [withdrawalId], references: [id])
}

enum EarningStatus {
  PENDING
  WITHDRAWN
  FAILED
}

model Withdrawal {
  id                 String           @id @default(cuid())
  creatorId          String
  totalAmountUsdc    Float
  payoutEmail        String
  locusTransactionId String?
  status             WithdrawalStatus @default(PROCESSING)
  createdAt          DateTime         @default(now())

  creator            User             @relation(fields: [creatorId], references: [id])
  earnings           Earning[]
}

enum WithdrawalStatus {
  PROCESSING
  SENT
  FAILED
}
```

Run: npx prisma generate && npx prisma db push

---

## PROJECT STRUCTURE

```
invoke-studio/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                           ← Landing page (7 sections)
│   ├── marketplace/
│   │   ├── page.tsx                       ← Browse + filter tools
│   │   └── [slug]/
│   │       └── page.tsx                   ← Tool detail + run flow
│   ├── dashboard/
│   │   ├── layout.tsx                     ← Sidebar layout, requires auth
│   │   ├── page.tsx                       ← Redirect to tools
│   │   ├── tools/
│   │   │   ├── page.tsx                   ← My tools table
│   │   │   ├── new/page.tsx               ← Create tool form + field builder
│   │   │   └── [id]/page.tsx              ← Edit tool
│   │   ├── earnings/page.tsx              ← Balance, earnings, withdraw
│   │   └── settings/page.tsx              ← Payout email
│   └── api/
│       ├── tools/[toolId]/run/route.ts    ← POST: public
│       ├── runs/[runId]/route.ts          ← GET: public
│       ├── withdrawals/route.ts           ← POST: auth required
│       └── webhooks/locus/route.ts        ← POST: Locus calls this
├── components/
│   ├── ui/                                ← shadcn + beams-background.tsx
│   ├── landing/
│   │   ├── hero.tsx
│   │   ├── how-it-works.tsx
│   │   ├── featured-tools.tsx
│   │   ├── for-creators.tsx
│   │   ├── agent-ready.tsx
│   │   ├── cta-banner.tsx
│   │   └── footer.tsx
│   ├── marketplace/
│   │   ├── tool-card.tsx
│   │   └── category-filter.tsx
│   ├── tool/
│   │   ├── run-panel.tsx                  ← State machine: form→checkout→processing→result
│   │   ├── input-form.tsx                 ← Renders dynamically from inputSchema
│   │   ├── checkout-panel.tsx
│   │   └── result-display.tsx
│   └── dashboard/
│       ├── sidebar.tsx
│       ├── field-builder.tsx              ← Add/edit/remove/reorder input fields
│       └── tool-form.tsx
├── lib/
│   ├── locus.ts
│   ├── db.ts
│   └── auth.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── scripts/
    └── agent-demo.ts
```

---

## LIB FILES

lib/db.ts:
```typescript
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

lib/auth.ts:
```typescript
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [GitHub],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

app/auth/[...nextauth]/route.ts:
```typescript
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

lib/locus.ts:
```typescript
// No server-side SDK exists — all Locus API calls use raw fetch
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
      description: `${params.toolName} — 1 run`,
      successUrl: `${baseUrl}/marketplace/${params.toolSlug}?run=${params.runId}`,
      cancelUrl: `${baseUrl}/marketplace/${params.toolSlug}`,
      webhookUrl: `${baseUrl}/api/webhooks/locus`,
      metadata: { runId: params.runId, toolId: params.toolId },
    }),
  });

  if (!res.ok) throw new Error(`Locus session creation failed: ${await res.text()}`);
  const data = await res.json();

  // Real response shape: { id, checkoutUrl, amount, currency, status, expiresAt }
  // webhookSecret is NOT returned — skip signature verification for MVP
  return {
    sessionId: data.data.id,
    checkoutUrl: data.data.checkoutUrl,
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

export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret) return true;
  const expected = "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch { return false; }
}
```

---

## API ROUTES

### POST /api/tools/[toolId]/run
Public. Called by humans (after clicking Run Tool) and agents.
The webhookUrl Locus will call is set here inside createCheckoutSession — not in any Locus dashboard.

```typescript
// app/api/tools/[toolId]/run/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/locus";

export async function POST(req: NextRequest, { params }: { params: { toolId: string } }) {
  const body = await req.json();
  const tool = await db.tool.findUnique({ where: { id: params.toolId, isPublished: true } });
  if (!tool) return NextResponse.json({ error: "Tool not found" }, { status: 404 });

  const schema = tool.inputSchema as Array<{ id: string; required: boolean }>;
  const inputs = body.inputs ?? {};
  for (const field of schema) {
    if (field.required && !inputs[field.id]?.trim()) {
      return NextResponse.json({ error: `Field "${field.id}" is required` }, { status: 400 });
    }
  }

  const run = await db.run.create({
    data: {
      toolId: tool.id,
      locusSessionId: `pending_${Date.now()}`,
      webhookSecret: "",
      inputData: inputs,
      status: "PENDING",
    },
  });

  const session = await createCheckoutSession({
    toolId: tool.id,
    toolSlug: tool.slug,
    runId: run.id,
    toolName: tool.name,
    priceUsdc: tool.priceUsdc,
  });

  await db.run.update({
    where: { id: run.id },
    data: { locusSessionId: session.sessionId, webhookSecret: session.webhookSecret },
  });

  return NextResponse.json({
    runId: run.id,
    sessionId: session.sessionId,
    expiresAt: session.expiresAt,
  });
}
```

### GET /api/runs/[runId]
Public. Poll for status and result.

```typescript
// app/api/runs/[runId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { runId: string } }) {
  const run = await db.run.findUnique({
    where: { id: params.runId },
    select: { id: true, status: true, result: true, createdAt: true, completedAt: true },
  });
  if (!run) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(run);
}
```

### POST /api/webhooks/locus
Locus calls this after payment confirmed on-chain. This is where everything happens.

```typescript
// app/api/webhooks/locus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature, executeToolWithClaude } from "@/lib/locus";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("x-signature-256") ?? "";
  const event = req.headers.get("x-webhook-event") ?? "";

  if (event !== "checkout.session.paid") return NextResponse.json({ ok: true });

  let body: any;
  try { body = JSON.parse(payload); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const runId = body?.data?.metadata?.runId;
  const txHash = body?.data?.paymentTxHash;
  const payerAddress = body?.data?.payerAddress;

  if (!runId) return NextResponse.json({ error: "No runId in metadata" }, { status: 400 });

  const run = await db.run.findUnique({
    where: { id: runId },
    include: { tool: { include: { creator: true } } },
  });

  if (!run || run.status !== "PENDING") return NextResponse.json({ ok: true });

  if (!verifyWebhookSignature(payload, signature, run.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  await db.run.update({ where: { id: runId }, data: { status: "PAID", payerAddress, txHash } });

  const schema = run.tool.inputSchema as Array<{ id: string; label: string }>;
  const inputData = run.inputData as Record<string, string>;
  const userInput = schema.map((f) => `${f.label}:\n${inputData[f.id] ?? ""}`).join("\n\n---\n\n");

  try {
    const result = await executeToolWithClaude({
      systemPrompt: run.tool.systemPrompt,
      userInput,
    });

    await db.$transaction([
      db.run.update({
        where: { id: runId },
        data: { result, status: "COMPLETED", completedAt: new Date() },
      }),
      db.tool.update({
        where: { id: run.tool.id },
        data: { runCount: { increment: 1 } },
      }),
      db.earning.create({
        data: {
          creatorId: run.tool.creator.id,
          runId: run.id,
          amountUsdc: parseFloat((run.tool.priceUsdc * 0.8).toFixed(6)),
          status: "PENDING",
        },
      }),
    ]);
  } catch (err) {
    console.error("AI execution failed:", err);
    await db.run.update({ where: { id: runId }, data: { status: "FAILED" } });
  }

  return NextResponse.json({ ok: true });
}
```

### POST /api/withdrawals
Auth required. Aggregates all pending earnings into one Locus payout call.

```typescript
// app/api/withdrawals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendCreatorPayout } from "@/lib/locus";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const pendingEarnings = await db.earning.findMany({ where: { creatorId: userId, status: "PENDING" } });
  if (pendingEarnings.length === 0) return NextResponse.json({ error: "No pending earnings" }, { status: 400 });

  const totalAmount = pendingEarnings.reduce((sum, e) => sum + e.amountUsdc, 0);
  const user = await db.user.findUnique({ where: { id: userId } });
  const payoutEmail = user?.payoutEmail ?? user?.email!;

  const withdrawal = await db.withdrawal.create({
    data: {
      creatorId: userId,
      totalAmountUsdc: parseFloat(totalAmount.toFixed(6)),
      payoutEmail,
      status: "PROCESSING",
      earnings: { connect: pendingEarnings.map((e) => ({ id: e.id })) },
    },
  });

  await db.earning.updateMany({
    where: { id: { in: pendingEarnings.map((e) => e.id) } },
    data: { status: "WITHDRAWN", withdrawalId: withdrawal.id },
  });

  try {
    const txId = await sendCreatorPayout({
      payoutEmail,
      amountUsdc: totalAmount,
      creatorName: user?.name ?? payoutEmail,
    });
    await db.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "SENT", locusTransactionId: txId } });
    return NextResponse.json({ success: true, transactionId: txId, amount: totalAmount });
  } catch (err) {
    await db.withdrawal.update({ where: { id: withdrawal.id }, data: { status: "FAILED" } });
    return NextResponse.json({ error: "Payout failed" }, { status: 500 });
  }
}
```

---

## PAGE SPECIFICATIONS

### Landing Page — app/page.tsx

7 sections. This is the most important page visually.

**Section 1 — Hero (dark, full viewport height)**
BeamsBackground wraps all content:
- Top nav inside the hero: Logo (logo.png if present) + "Invoke Studio" left | Marketplace + How it Works center | Sign In right
- Center content:
  - Pill badge: "Now in Beta" with subtle border and glow
  - H1 (large, 72px+, bold, tight tracking, white, text-balance): "The Marketplace for AI-Powered Tools"
  - Subheadline (white/70, max-w-lg, centered): "Publish your expertise as a pay-per-run tool. Humans and AI agents pay in USDC. You earn automatically."
  - Button row: "Explore Tools" (filled cyan) | "Start Selling" (ghost white border)
  - Stats row below buttons: "40+ Tools" · "$0 Setup" · "Agent-Native" — separated by centered dots, small, white/50
  - Scroll hint at bottom center

**Section 2 — How It Works (white background)**
- Centered heading: "Simple by Design"
- 3 numbered columns with Lucide icons:
  1. "Create a Tool" — Write a system prompt, define the input form, set your price. Publish in minutes.
  2. "Buyers Run It" — Humans and AI agents fill the form, pay once in USDC, get results instantly.
  3. "You Get Paid" — Earnings accumulate in your dashboard. Withdraw to your email anytime.
- Large number badges (1, 2, 3), icon, title, 2-line description

**Section 3 — Featured Tools (gray-50)**
- Heading left + "View all →" right
- 6 tool cards in responsive 3-col grid from seed data
- Tool card: category badge (colored), tool name, 2-line description (line-clamp-2), creator name, "$X.XX / run" price badge
- Full card clickable. Hover: shadow-md + -translate-y-0.5

**Section 4 — For Creators (white, split)**
- Left 50%: "Turn Prompts into Recurring Revenue" heading
  - 4 checkmark bullets: No fees to publish | 80% revenue share | USDC — no chargebacks | Works for agents too
  - "Create Your First Tool" button
- Right 50%: a UI-built earnings mockup card (dark gray-900 card):
  - "Your Earnings" label
  - "$47.20 USDC" large balance
  - Mini table: 3 fake recent runs with tool name + amount
  - "Withdraw" button inside the card

**Section 5 — Agent Ready (gray-50, centered)**
- Bot icon (Lucide Bot, large)
- Heading: "Built for the Agent Economy"
- Description: "Agents can discover and pay for tools programmatically. No UI required — just an API call and a Locus wallet."
- Dark styled code block showing:
  POST /api/tools/{toolId}/run
  ← { sessionId }

  preflight → pay → confirm

  GET /api/runs/{runId}
  ← { status: "COMPLETED", result: "..." }

**Section 6 — CTA Banner (dark, simple)**
- "Start building. Start earning."
- "Sign in with GitHub" button

**Section 7 — Footer (white, minimal)**
- Logo + name + tagline
- Links: Marketplace | Dashboard
- "© 2026 Invoke Studio. Powered by Locus."

---

### Marketplace Page — app/marketplace/page.tsx

Server component.

- Header: "AI Tools Marketplace" + subtitle
- Category filter pills: All | Writing | Legal | Code | Business | Research | Finance
  - Active: filled bg. Inactive: border only. Filter via URL search param ?category=CODE
- Tool grid: 3 cols → 2 → 1
- Each card: category badge, name, description (clamped), creator avatar+name, run count, price, full card is a link

---

### Tool Detail Page — app/marketplace/[slug]/page.tsx

Left panel (60%) — server rendered:
- Breadcrumb: Marketplace → Category → Tool Name
- Category badge + Tool name (large)
- Creator row: avatar, name, run count
- Full description
- "What you'll get" — exampleOutput rendered as formatted markdown-style text
- "Input required" — list the field labels so buyers know what to prepare
- Constraints note: "Text input only. No file uploads. Each field has a character limit."

Right panel (40%) — RunPanel client component with 5 states:

State A — FORM:
- "Run this tool" heading
- Price: large, prominent "$0.75 USDC per run"
- Dynamic input form rendered from tool.inputSchema:
  - text fields: standard input
  - textarea fields: resizable textarea with character counter "1,204 / 5,000"
  - Each field shows label, placeholder, required marker
- "Run for $X.XX" button (full width, primary)
- "No account required. Powered by Locus Checkout." small note

On "Run for $X.XX" click:
1. Call POST /api/tools/[toolId]/run with { inputs }
2. Receive { runId, sessionId }
3. Store runId in state
4. Transition to State B

State B — CHECKOUT:
- "Complete payment to run this tool" heading
- <LocusCheckout sessionId={sessionId} mode="embedded" onSuccess={handlePaymentSuccess} onCancel={handleCancel} />
- onSuccess: store runId, transition to State C
- "← Back" cancel link

State C — PROCESSING:
- Animated spinner or subtle pulse
- "Running tool..." heading
- "Claude is processing your input. This takes 5–15 seconds."
- Poll GET /api/runs/[runId] every 2 seconds
- On COMPLETED: transition to State D
- On FAILED: transition to State E

State D — RESULT:
- "✓ Result ready" in green
- Result in styled box: white bg, border, rounded, padding
  - If result looks like code (contains ```) use font-mono text-sm
  - Otherwise use readable prose styling with whitespace-pre-wrap
- "Copy result" button
- "Run again" button (resets form, keeps input values)

State E — FAILED:
- "Something went wrong" message
- "Try again" button (resets to State A)

---

### Dashboard

Layout — app/dashboard/layout.tsx:
Auth check. Redirect to / if no session.
Sidebar 240px fixed:
- Logo + "Invoke Studio" top
- Nav: LayoutGrid (My Tools) | DollarSign (Earnings) | Settings
- Bottom: user avatar, name, email, sign out

My Tools — app/dashboard/tools/page.tsx:
- "My Tools" header + "Create Tool" button top right
- Table: Tool Name | Category | Price | Runs | Status | Edit button | Publish/Unpublish toggle
- Empty state: illustration + "Create your first tool" CTA

Create Tool — app/dashboard/tools/new/page.tsx:

Section 1 — Basics:
- Tool Name (text, required)
- Category (select)
- Description (textarea, 300 char max, shown to buyers)
- Price per run (number, min 0.10, step 0.05, $ prefix, USDC suffix)
- Example Output (textarea, 1000 char max, optional, shown on tool page to demonstrate quality)

Section 2 — System Prompt:
- Large textarea
- Label: "System Prompt (never shown to buyers — this is your expertise)"
- Helper: "Write the instruction sent to Claude before every buyer's input. Be specific about the format, tone, and structure of the output. Better prompts = better results = more repeat buyers."
- Character count display

Section 3 — Input Fields (the field builder):
- Heading: "Define the buyer's input form"
- Helper: "Design these fields to give Claude exactly the context it needs. Each field maps to one piece of information you've found essential for good results."

The field builder component (components/dashboard/field-builder.tsx):
- Existing fields shown as draggable rows:
  [drag handle] | [label] | [type badge] | [char limit if textarea] | [required badge] | [Edit] [Delete]
- "+ Add Field" button opens inline form:
  - Label (text, required) — what buyer sees above the field
  - Type (radio: "Short text" / "Long text (textarea)")
  - Placeholder (text) — grey helper text inside the field
  - Character Limit (number, only if textarea, default 2000, min 100, max 10000)
  - Required (toggle)
  - "Add Field" / "Cancel"
- After adding, field appears in the list immediately
- Live preview below the list: renders the exact form buyers will see (read-only, with placeholder values)
- Minimum 1 field required to publish

Section 4 — Constraints reminder:
Static info card listing what tools can and cannot do. Helps creators design within limits.

Section 5 — Actions:
- "Save as Draft" (secondary)
- "Publish Tool" (primary, disabled until all required sections complete)

On save: POST to /api/dashboard/tools (create) with full form data including inputSchema array.

Earnings — app/dashboard/earnings/page.tsx:

Stats row (3 cards):
- Available to Withdraw: sum of PENDING earnings
- Total Earned All Time: sum of all earnings
- Total Runs: count of COMPLETED runs

Withdraw button:
- "Withdraw $X.XX USDC" — large, prominent, disabled if $0
- Click → confirmation modal:
  - Amount, payout email
  - "Funds arrive via email claim link from Locus. No prior crypto account needed."
  - Confirm → POST /api/withdrawals
  - Success: "✓ Check your email for the claim link"

Per-tool earnings table: Tool | Runs | Earned | Last run

Recent earnings log: tool name | date | amount | PENDING/WITHDRAWN badge

Settings — app/dashboard/settings/page.tsx:
- Payout Email field (pre-filled from GitHub email, editable)
- "This is where Locus sends your USDC when you withdraw. You'll get an email with a claim link. No Locus account needed in advance."
- Save button

---

## SEED DATA

prisma/seed.ts — 6 professional tools. These populate the marketplace immediately.
The system prompts here demonstrate what expert-level prompts look like — they are what make tools worth paying for.

```typescript
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const creator = await db.user.upsert({
    where: { email: "team@invokestudio.xyz" },
    update: {},
    create: {
      email: "team@invokestudio.xyz",
      name: "Invoke Studio Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=IF&backgroundColor=0ea5e9",
      payoutEmail: "team@invokestudio.xyz",
    },
  });

  const tools = [
    {
      name: "Contract Risk Scanner",
      slug: "contract-risk-scanner",
      description: "Paste any business contract and get a structured breakdown of risky clauses, missing protections, and specific negotiation points. Built for freelancers and small business owners.",
      category: "LEGAL" as const,
      priceUsdc: 0.75,
      exampleOutput: "## Contract Risk Analysis\n\n### 🔴 RED FLAGS\n**Clause 4.2 — Unlimited Liability**\nThis clause holds you liable for indirect and consequential damages with no cap. Negotiate a liability cap equal to the total contract value.\n\n**Clause 7.1 — Blanket IP Assignment**\nAll work product including your pre-existing tools transfers to the client. Limit to deliverables created specifically for this project.\n\n### 🟡 MISSING PROTECTIONS\n- No payment terms or late penalties\n- No kill fee for mid-project cancellation\n- No dispute resolution clause\n\n### 💬 NEGOTIATION POINTS\n1. Clause 4.2: Replace with 'Liability limited to total fees paid under this agreement'\n2. Clause 7.1: Add 'excluding Contractor's pre-existing tools, frameworks, and methodologies'",
      systemPrompt: `You are a commercial lawyer with 15 years of experience reviewing contracts for freelancers and small business owners. Your job is to protect the weaker party.

Analyze the provided contract text and produce a structured report with exactly three sections:

## 🔴 RED FLAGS
List clauses that are dangerous, heavily favor the other party, or are non-standard. For each: quote the relevant clause, explain in plain language why it's dangerous, state specifically what to push back on.

## 🟡 MISSING PROTECTIONS
List standard protections that should be present but aren't. For each: name the clause type, explain why it matters, provide suggested language.

## 💬 NEGOTIATION POINTS
3-5 specific, actionable recommendations. For each: reference the clause number, state the problem, provide exact replacement language.

Be direct. Assume the reader is not a lawyer. No disclaimers — give real, actionable analysis.`,
      inputSchema: [
        { id: "contract", label: "Contract Text", type: "textarea", placeholder: "Paste the full contract text here. Plain text is fine — no formatting needed.", charLimit: 8000, required: true },
        { id: "context", label: "Your Role in This Contract", type: "text", placeholder: "e.g. I am the freelancer / I am the buyer / I am the service provider", charLimit: 200, required: false },
      ],
    },
    {
      name: "Security Code Audit",
      slug: "security-code-audit",
      description: "Paste a function or module and get a focused security audit: vulnerabilities ranked by severity, each with a patched version. Works for any language.",
      category: "CODE" as const,
      priceUsdc: 0.65,
      exampleOutput: "## Security Audit\n\n### CRITICAL\n**SQL Injection — Line 23**\n`query = 'SELECT * FROM users WHERE email = ' + email`\nDirect string concatenation allows injection. Patched:\n```python\ncursor.execute('SELECT * FROM users WHERE email = %s', (email,))\n```\n\n### HIGH\n**Missing input validation — Line 41**\nNo length check on amount field before payment processing. Add: `if not 0 < amount <= 10000: raise ValueError`\n\n### LOW\n**Hardcoded timeout — Line 89**\nMove to environment config for flexibility without redeployment.",
      systemPrompt: `You are a senior application security engineer conducting a focused code security review.

Analyze the provided code ONLY for security vulnerabilities. Do not comment on style, performance, or non-security issues.

Organize findings by severity:

### CRITICAL
Direct data exfiltration, authentication bypass, remote code execution. Must fix before any deployment.

### HIGH
Exploitable under specific conditions or exposes sensitive data.

### MEDIUM
Security weaknesses requiring unusual conditions to exploit.

### LOW
Minor issues or patterns that create future risk.

For each finding:
- State the vulnerability type
- Reference the specific line(s)
- Quote the vulnerable code
- Explain the attack vector in one sentence
- Provide a patched version of that specific code block

Omit severity sections with no findings. Be technical and precise.`,
      inputSchema: [
        { id: "code", label: "Code to Audit", type: "textarea", placeholder: "Paste the code here. Focus on a specific function or endpoint for best results.", charLimit: 5000, required: true },
        { id: "language", label: "Language / Framework", type: "text", placeholder: "e.g. Python / Django, TypeScript / Express, PHP / Laravel", charLimit: 100, required: true },
        { id: "context", label: "What does this code do?", type: "textarea", placeholder: "e.g. This handles user authentication and session management", charLimit: 500, required: false },
      ],
    },
    {
      name: "Startup Pitch Critiquer",
      slug: "startup-pitch-critiquer",
      description: "Get an honest, investor-level critique of your startup pitch. Know the exact pushback questions before you're in the room.",
      category: "BUSINESS" as const,
      priceUsdc: 0.75,
      exampleOutput: "## Pitch Critique\n\n### What's Working\nThe problem is clearly defined. The 'verified student' angle is a genuine moat that's easy to explain and hard to replicate.\n\n### What Investors Will Push Back On\n**'Why hasn't this worked before?'**\nYou need a clear answer to why previous campus marketplace attempts failed. Prepare: 'X failed because of Y. We solve Y by doing Z.'\n\n**'What stops WhatsApp from building this?'**\nFocus on: trust layer (verification), structured discovery, transaction infrastructure — none of which WhatsApp will build for a niche use case.\n\n### The One Unanswered Question\nWhat does 'verified student' mean in practice? How do you verify? This is load-bearing for your entire value proposition.\n\n### Suggested Rewrites\nChange: 'We're building a campus marketplace'\nTo: 'We're building the economic infrastructure for campus life'",
      systemPrompt: `You are a partner at a top-tier VC firm with 12 years evaluating early-stage startups. You are direct, skeptical, and helpful. You have seen thousands of pitches.

Analyze the provided startup pitch and produce:

### What's Working
2-3 specific strengths. Be brief — investors don't dwell on positives.

### What Investors Will Push Back On
3-5 hardest questions this pitch will face. For each:
- The exact question an investor will ask
- Why it's a problem with the current pitch
- A specific, concrete answer the founder should prepare

### The One Unanswered Question
The single most important thing missing. The thing that, if unanswered, kills the deal.

### Suggested Rewrites
2-3 specific lines that should change, with exact replacement language.

Be direct. Do not soften bad feedback. A founder who hears hard truths is better prepared than one who gets empty validation.`,
      inputSchema: [
        { id: "oneliner", label: "One-line description of your startup", type: "text", placeholder: "e.g. We're building the campus micro-economy platform for Nigerian university students", charLimit: 200, required: true },
        { id: "problem", label: "The problem you're solving", type: "textarea", placeholder: "Who has this problem? How bad is it? What do they do today?", charLimit: 600, required: true },
        { id: "solution", label: "Your solution and how it works", type: "textarea", placeholder: "What do you build? How is it different?", charLimit: 600, required: true },
        { id: "traction", label: "Current traction", type: "textarea", placeholder: "Users, revenue, growth — or honestly describe your stage if pre-launch", charLimit: 300, required: true },
        { id: "ask", label: "Your ask (optional)", type: "text", placeholder: "e.g. $500K pre-seed to reach 1,000 paying users in 6 months", charLimit: 300, required: false },
      ],
    },
    {
      name: "Investor Update Email",
      slug: "investor-update-email",
      description: "Generate a polished monthly investor update from your raw metrics and notes. Concise, structured, the way investors actually want to read it.",
      category: "WRITING" as const,
      priceUsdc: 0.35,
      exampleOutput: "Subject: Invoke Studio — April Update\n\nHi everyone,\n\nQuick update for April.\n\n**The headline:** Crossed 100 tool creators and $2,400 in GMV. The surprise: 30% of all runs are now from AI agents, up from 8% in March.\n\n**What's working:** Agent adoption is moving faster than expected. Creator retention is strong — 70% publish a second tool within 2 weeks.\n\n**What's not:** Creator onboarding drop-off is too high. 45% start the tool creation flow and don't finish. Simplifying the field builder this week.\n\n**This month:** Outreach to 50 dev newsletters. Reduce creation drop-off to <20%. Add tool analytics.\n\n**Ask:** Intros to anyone running an AI-native developer tools fund.\n\nYusuf",
      systemPrompt: `You are an experienced startup founder writing a monthly investor update. Investors skim these. You write with clarity, honesty, and specificity.

Write a monthly investor update email with:
1. Subject line: "[Company] — [Month] Update"
2. One opening sentence capturing the most important thing that happened
3. Structure: The headline | What's working | What's not | This month's priorities | Ask (if provided)
4. Honest about what's not working — investors respect this
5. Specific numbers wherever provided
6. 250-350 words maximum
7. Tone: direct, professional, human — never corporate

Do not use "excited to share" or "thrilled to announce." Start strong, stay specific, end with a clear ask or next step.`,
      inputSchema: [
        { id: "company", label: "Company Name", type: "text", placeholder: "e.g. Invoke Studio", charLimit: 100, required: true },
        { id: "metrics", label: "Key metrics this month", type: "textarea", placeholder: "e.g. MRR: $1,200 (+18% MoM), Active users: 340, Churn: 3.2%", charLimit: 400, required: true },
        { id: "wins", label: "Biggest wins", type: "textarea", placeholder: "What went well? Specific milestones, partnerships, launches...", charLimit: 400, required: true },
        { id: "blockers", label: "What's not working", type: "textarea", placeholder: "Be honest. What's behind plan? What's harder than expected?", charLimit: 400, required: true },
        { id: "priorities", label: "Top priorities next month", type: "textarea", placeholder: "What are you focused on? Be specific.", charLimit: 300, required: true },
        { id: "ask", label: "Your ask (optional)", type: "text", placeholder: "e.g. Intros to fintech founders, candidates for CTO role", charLimit: 300, required: false },
      ],
    },
    {
      name: "Unit Economics Analyzer",
      slug: "unit-economics-analyzer",
      description: "Input your key business metrics and get a clear health diagnosis: key ratios vs benchmarks, danger zones, and exactly what to fix first.",
      category: "FINANCE" as const,
      priceUsdc: 0.65,
      exampleOutput: "## Unit Economics Analysis\n\n### Overall Health: ⚠️ At Risk\n\nYour LTV:CAC of 1.8x is below the 3x minimum. You're acquiring customers for more than you'll recover in profit within a reasonable timeframe.\n\n### Key Ratios\n| Metric | Yours | Benchmark | Status |\n|--------|-------|-----------|--------|\n| LTV:CAC | 1.8x | >3x | 🔴 |\n| Payback Period | 18mo | <12mo | 🟡 |\n| Gross Margin | 62% | >60% | ✅ |\n| Monthly Churn | 4.2% | <2% | 🔴 |\n\n### The Core Problem\nChurn is destroying LTV. At 4.2% monthly churn your average customer stays 24 months. At 2% they'd stay 50 months — LTV doubles.\n\n### Fix This First\n1. Reduce monthly churn 4.2% → 2% — this alone brings LTV:CAC to 3.6x\n2. Reduce CAC from $240 → $180 — shift paid budget to content/referral\n3. Do NOT raise prices until churn is fixed — it accelerates churn",
      systemPrompt: `You are a CFO specializing in SaaS and marketplace businesses. You give founders the honest truth about their unit economics.

Analyze the provided metrics and produce:

### Overall Health
One of: ✅ Healthy | ⚠️ At Risk | 🔴 Critical
One sentence diagnosis.

### Key Ratios
A table: metric name | their number | industry benchmark | status (✅/🟡/🔴).
Calculate LTV:CAC, payback period, and any other relevant ratios. Show calculations if non-obvious.

### The Core Problem
The single most important thing that's wrong. Reference their actual numbers.

### Fix This First
3 specific, prioritized recommendations. For each: what to change, what impact it has on the key ratios, why it's more important than other things.

If their economics are healthy, confirm it clearly and identify the most important metric to protect.

Use plain language. Define jargon. Be direct.`,
      inputSchema: [
        { id: "model", label: "Business Model", type: "text", placeholder: "e.g. B2B SaaS monthly subscription, B2C marketplace (take rate), usage-based billing", charLimit: 100, required: true },
        { id: "cac", label: "Customer Acquisition Cost (CAC)", type: "text", placeholder: "e.g. $240 — total sales & marketing last month ÷ new customers acquired", charLimit: 100, required: true },
        { id: "arpu", label: "Average Revenue Per User / Month (ARPU)", type: "text", placeholder: "e.g. $45/month average across all active paying customers", charLimit: 100, required: true },
        { id: "churn", label: "Monthly Churn Rate", type: "text", placeholder: "e.g. 3.5% — customers lost this month ÷ customers at start of month", charLimit: 100, required: true },
        { id: "margin", label: "Gross Margin", type: "text", placeholder: "e.g. 68% — (revenue - COGS) ÷ revenue. COGS includes hosting, support, API costs", charLimit: 100, required: true },
        { id: "context", label: "Additional context (optional)", type: "textarea", placeholder: "Stage, what you're optimizing for, anything that affects the analysis", charLimit: 400, required: false },
      ],
    },
    {
      name: "Database Schema Reviewer",
      slug: "database-schema-reviewer",
      description: "Paste your Prisma schema or SQL DDL and get a focused review: missing indexes, normalization issues, N+1 risks, and security concerns — with exact fixes.",
      category: "CODE" as const,
      priceUsdc: 0.60,
      exampleOutput: "## Schema Review\n\n### 🔴 Critical\n**Missing index on posts.userId**\nEvery query filtering posts by user does a full table scan. At 10k+ rows this becomes slow.\nFix: add `@@index([userId])` to the Post model.\n\n**Missing index on orders.status**\nYou'll query orders by status constantly (pending, failed). Add `@@index([status])`.\n\n### 🟡 Design Issues\n**address stored as single string in User**\nBlocks filtering by city/country and any future geo queries. Split into: street, city, state, country, postalCode.\n\n**No soft delete pattern**\nDeleting users hard-deletes all their content. Add `deletedAt DateTime?` to User and content tables.\n\n### ✅ What's Good\n- cuid() IDs used correctly\n- Cascade deletes set correctly on Account and Session",
      systemPrompt: `You are a senior database engineer with deep expertise in PostgreSQL and Prisma ORM.

Analyze the provided schema and produce:

### 🔴 Critical
Issues that will cause real problems: missing indexes on frequently queried fields, missing foreign key constraints, data types causing overflow or corruption, security issues (plaintext passwords, unencrypted PII).

### 🟡 Design Issues
Normalization problems, decisions that will cause pain at scale, missing soft delete patterns, inefficient structures.

### ✅ What's Good
2-3 things done correctly. Brief.

### Recommended Additions
Exact Prisma or SQL additions for every Critical and important Design issue. Ready to copy-paste.

Be specific. Reference model names and field names. Explain WHY each issue matters — what specific query or situation will it break? If the schema is well-designed, say so and focus only on genuine improvements.`,
      inputSchema: [
        { id: "schema", label: "Schema", type: "textarea", placeholder: "Paste your full Prisma schema or SQL DDL here...", charLimit: 6000, required: true },
        { id: "orm", label: "ORM / Database", type: "text", placeholder: "e.g. Prisma + PostgreSQL, Drizzle + SQLite, raw SQL + MySQL", charLimit: 100, required: true },
        { id: "scale", label: "Expected scale (optional)", type: "text", placeholder: "e.g. ~10k users, ~1M rows in posts table at maturity", charLimit: 200, required: false },
      ],
    },
  ];

  for (const tool of tools) {
    await db.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: {
        ...tool,
        creatorId: creator.id,
        isPublished: true,
        runCount: Math.floor(Math.random() * 40) + 5,
      },
    });
  }

  console.log("✅ Seed complete — 6 tools created");
}

main().catch(console.error).finally(() => db.$disconnect());
```

Add to package.json:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Run: npx prisma db seed

---

## AGENT DEMO SCRIPT

scripts/agent-demo.ts — shows full autonomous agent payment. Run this in the demo video.

```typescript
// Run: LOCUS_KEY=claw_xxx TOOL_ID=xxx BASE_URL=https://your-domain.vercel.app npx ts-node scripts/agent-demo.ts

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const LOCUS_KEY = process.env.LOCUS_KEY!;
const LOCUS_BASE = "https://beta-api.paywithlocus.com/api";
const TOOL_ID = process.env.TOOL_ID!;

async function locus(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${LOCUS_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${LOCUS_KEY}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function poll<T>(fn: () => Promise<T>, done: (v: T) => boolean, ms = 2000, max = 30): Promise<T> {
  for (let i = 0; i < max; i++) {
    const v = await fn();
    if (done(v)) return v;
    await new Promise(r => setTimeout(r, ms));
    process.stdout.write(".");
  }
  throw new Error("Polling timed out");
}

async function main() {
  console.log("\n🤖  Invoke Studio — Autonomous Agent Demo\n");
  console.log("This script demonstrates an AI agent discovering, paying for,");
  console.log("and receiving results from a tool — with zero human interaction.\n");

  // Step 1: Create run (same endpoint humans use)
  console.log("1/5  Creating run...");
  const run = await fetch(`${BASE_URL}/api/tools/${TOOL_ID}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: {
        company: "Stripe",
        problem: "Developers spend weeks integrating payment APIs from scratch for every new project",
        product: "Invoke Studio — a pay-per-run AI tools marketplace for humans and agents",
      },
    }),
  }).then(r => r.json());

  console.log(`     ✓  Run: ${run.runId}`);
  console.log(`     ✓  Session: ${run.sessionId}`);

  // Step 2: Preflight
  console.log("2/5  Preflight check...");
  const preflight = await locus(`/checkout/agent/preflight/${run.sessionId}`);
  if (!preflight.data?.canPay) throw new Error(`Cannot pay: ${JSON.stringify(preflight.data?.blockers)}`);
  console.log("     ✓  Balance sufficient");

  // Step 3: Pay
  console.log("3/5  Paying...");
  const payment = await locus(`/checkout/agent/pay/${run.sessionId}`, "POST");
  const txId = payment.data?.transactionId;
  console.log(`     ✓  TX submitted: ${txId}`);

  // Step 4: On-chain confirmation
  process.stdout.write("4/5  Waiting for on-chain confirmation");
  await poll(
    () => locus(`/checkout/agent/payments/${txId}`),
    (r) => ["CONFIRMED", "FAILED"].includes(r.data?.status)
  );
  console.log(" ✓");

  // Step 5: Tool result
  process.stdout.write("5/5  Waiting for AI execution");
  const result = await poll<any>(
    () => fetch(`${BASE_URL}/api/runs/${run.runId}`).then(r => r.json()),
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

main().catch(console.error);
```

---

## DESIGN SYSTEM

Theme: Light throughout. The BeamsBackground hero is the only dark section.

Colors:
- Page: white / gray-50 (alternating sections)
- Text: gray-900 (headings) / gray-600 (body) / gray-400 (muted)
- Accent: cyan-500 / cyan-600
- Border: gray-200

Category badge colors:
- WRITING:  bg-violet-100 text-violet-700
- LEGAL:    bg-amber-100 text-amber-700
- CODE:     bg-cyan-100 text-cyan-700
- BUSINESS: bg-blue-100 text-blue-700
- RESEARCH: bg-emerald-100 text-emerald-700
- FINANCE:  bg-green-100 text-green-700

Cards: bg-white border border-gray-200 rounded-xl shadow-sm
Card hover: shadow-md -translate-y-0.5 transition-all duration-200

Buttons:
- Primary: bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 py-2 font-medium
- Accent: bg-cyan-500 text-white hover:bg-cyan-600 rounded-lg px-4 py-2 font-medium
- Secondary: border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-4 py-2 font-medium

Typography: Geist or Inter. Headings: font-semibold tracking-tight. Use text-balance on hero headings.

Navbar on scroll: backdrop-blur-md bg-white/80 border-b border-gray-200

---

## BUILD ORDER

Next.js 16 is already scaffolded and set up. Start from step 1.

1.  Install all dependencies (see INSTALL section)
2.  npx shadcn@latest init
3.  Copy beams-background.tsx to components/ui/
4.  Create lib/db.ts, lib/auth.ts, lib/locus.ts
5.  Create prisma/schema.prisma → npx prisma generate && npx prisma db push
6.  Create app/auth/[...nextauth]/route.ts
7.  Build API routes:
    - POST /api/tools/[toolId]/run
    - GET /api/runs/[runId]
    - POST /api/webhooks/locus
    - POST /api/withdrawals
8.  Build landing page (all 7 sections)
9.  Build marketplace page + tool-card component
10. Build tool detail page (all 5 states of RunPanel)
11. Build dashboard layout + sidebar
12. Build my tools page
13. Build create tool page with field builder
14. Build earnings page with withdrawal modal
15. Build settings page
16. Run seed: npx prisma db seed
17. Build agent demo script
18. Test full flow:
    - Sign in → create tool → publish
    - Run as buyer → pay → result appears
    - Check earnings in dashboard
    - Trigger withdrawal → check email
    - Run agent demo script end to end
19. Deploy to Vercel
20. Update NEXT_PUBLIC_URL in Vercel env vars to live domain
21. Re-test on live URL

---

## CRITICAL NOTES

- export const dynamic = "force-dynamic" is required on the webhook route
- /api/tools/[toolId]/run and /api/runs/[runId] are FULLY PUBLIC — no auth. Agents call these.
- The webhookUrl is set per checkout session inside createCheckoutSession() — not in any Locus dashboard
- Creator earnings accumulate in DB as PENDING — money does NOT auto-send after each run. Creators withdraw manually from the earnings page.
- Locus send-email for withdrawals — creator does NOT need a Locus account in advance. They get an email from Locus with a claim link after withdrawal is triggered.
- LOCUS_API_KEY is never logged anywhere, never returned from any API route, never in any client component
- systemPrompt is NEVER sent to the client — server-side only
- Locus beta URL: https://beta-api.paywithlocus.com/api — the claw_dev_ key is rejected by production URL
- inputSchema is stored as JSON array in Postgres — it drives both the field builder UI and the buyer's run form
- All monetary amounts: store as Float in Prisma, toFixed(2) when sending to Locus, toFixed(6) when storing earnings
- The Locus Wrapped Anthropic API endpoint is POST /wrapped/anthropic/chat — response is at data.data.content[0].text