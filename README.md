# Invoke Studio

> The marketplace for AI-powered tools. Pay per run. Built for humans and agents.

Invoke Studio lets developers and domain experts publish AI-powered tools as 
pay-per-run products. Buyers fill a form, pay in USDC via Locus Checkout, and 
get an expert-quality AI result instantly. AI agents can discover and pay for 
tools programmatically — no UI, no human approval, fully autonomous.

**Live:** https://invoke-studio.vercel.app  
**Built for:** Locus Paygentic Hackathon — Week 3 (Checkout with Locus track)

---

## How It Works

**For creators:**
1. Sign in with GitHub
2. Go to Dashboard → Create Tool
3. Write a system prompt (your expertise — never shown to buyers)
4. Define the input form buyers will fill
5. Set a price per run
6. Publish

Your tool is live on the marketplace immediately. Every time someone runs it, 
80% of the payment lands in your earnings balance. Withdraw to your email 
anytime — no crypto wallet required.

**For buyers:**
1. Browse the marketplace
2. Pick a tool, fill in the form
3. Pay in USDC via Locus Checkout
4. Result appears in 10–15 seconds

No account required. No subscription. Pay only for what you use.

**For AI agents:**
```bash
# 1. Create a run
POST /api/tools/{toolId}/run
Body: { "inputs": { "fieldId": "value", ... } }
Response: { "runId": "...", "sessionId": "..." }

# 2. Pay via Locus agent API
GET  /api/checkout/agent/preflight/{sessionId}
POST /api/checkout/agent/pay/{sessionId}
GET  /api/checkout/agent/payments/{txId}  # poll until CONFIRMED

# 3. Get result
GET  /api/runs/{runId}  # poll until status: COMPLETED
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** Neon Postgres (via Vercel)
- **ORM:** Prisma 6
- **Auth:** Auth.js v5 — GitHub OAuth
- **Payments:** Locus Checkout (collect) + Pay With Locus (distribute)
- **AI Execution:** Locus Wrapped Anthropic API (Claude Haiku)
- **Deployment:** Vercel

---

## Getting Started

### Prerequisites
- Node.js 20+
- A Neon Postgres database URL
- A GitHub OAuth App
- A Locus beta API key (`claw_dev_` prefix)

### Installation

```bash
git clone https://github.com/YusufsDesigns/invoke-studio
cd invoke-studio
npm install
```

### Environment Variables

Create `.env.local`:

```env
AUTH_SECRET=             # openssl rand -base64 32
AUTH_GITHUB_ID=          # GitHub OAuth App client ID
AUTH_GITHUB_SECRET=      # GitHub OAuth App client secret
NEXTAUTH_URL=http://localhost:3000

DATABASE_URL=            # Neon Postgres connection string

LOCUS_API_KEY=           # Your claw_dev_ key
LOCUS_API_BASE=https://beta-api.paywithlocus.com/api

NEXT_PUBLIC_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for Auth.js session signing |
| `AUTH_GITHUB_ID` | Client ID from your GitHub OAuth App |
| `AUTH_GITHUB_SECRET` | Client secret from your GitHub OAuth App |
| `DATABASE_URL` | Neon Postgres connection string |
| `LOCUS_API_KEY` | Locus beta API key — used for checkout, payouts, and AI execution |
| `LOCUS_API_BASE` | Locus beta API base URL |
| `NEXT_PUBLIC_URL` | Your app's public URL (localhost in dev, Vercel URL in prod) |

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed creates 6 published tools across 4 categories so the marketplace 
is not empty on first load.

### Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## Tool Categories

Invoke Studio supports text-in, structured-text-out tools in these categories:

| Category | Examples |
|---|---|
| **Legal** | Contract Risk Scanner, NDA Analyzer, TOS Summarizer |
| **Code** | Security Audit, Schema Reviewer, API Error Debugger |
| **Business** | Pitch Critiquer, Pricing Analyzer, OKR Generator |
| **Writing** | Investor Update Email, Performance Review Writer |
| **Research** | Business Idea Validator, Competitor Teardown |
| **Finance** | Unit Economics Analyzer, Financial Red Flag Scanner |

### Tool Constraints

Tools on Invoke Studio are text-in, text-out. The following are not supported:

- File or document uploads (paste text only)
- Live web search or real-time data
- Code execution (tools can generate code, not run it)
- Memory between runs (each run is fully independent)
- Multi-step workflows within a single run
- Image input or generation

These constraints are shown clearly to creators during tool creation.

---

## Agentic Payment Flow

Invoke Studio is built for the agent economy. Every tool is accessible to 
AI agents through the same API humans use, with payment handled via 
Locus's agent payment endpoints.

### How an agent uses a tool

```typescript
// 1. Discover available tools
const tools = await fetch('/api/tools').then(r => r.json());

// 2. Read the tool's inputSchema to know what to send
// inputSchema: [{ id, label, type, required, charLimit }]

// 3. Create a run with the correct inputs
const run = await fetch(`/api/tools/${toolId}/run`, {
  method: 'POST',
  body: JSON.stringify({ inputs: { fieldId: value } })
}).then(r => r.json());
// Returns: { runId, sessionId }

// 4. Preflight — verify the agent wallet can pay
const preflight = await fetch(
  `https://beta-api.paywithlocus.com/api/checkout/agent/preflight/${run.sessionId}`,
  { headers: { Authorization: `Bearer ${LOCUS_KEY}` } }
).then(r => r.json());

// 5. Pay
const payment = await fetch(
  `https://beta-api.paywithlocus.com/api/checkout/agent/pay/${run.sessionId}`,
  { method: 'POST', headers: { Authorization: `Bearer ${LOCUS_KEY}` } }
).then(r => r.json());

// 6. Poll for on-chain confirmation
// GET /api/checkout/agent/payments/{txId} until status: CONFIRMED

// 7. Poll for result
// GET /api/runs/{runId} until status: COMPLETED
```

### Agent spending constraints

Locus enforces configurable guardrails on agent wallets from the 
Locus dashboard:

| Guardrail | Behavior |
|---|---|
| **Allowance** | Max total USDC the agent can spend. Rejected if exceeded. |
| **Max transaction size** | Cap per single payment. Rejected if exceeded. |
| **Approval threshold** | Payments above this require human approval before executing. |

Agents hitting a guardrail will receive a rejection at the preflight step with 
a `blockers` array explaining why payment cannot proceed.

---

## Project Structure

```
invoke-studio/
├── app/
│   ├── page.tsx                    ← Landing page
│   ├── marketplace/
│   │   ├── page.tsx                ← Browse tools
│   │   └── [slug]/page.tsx         ← Tool detail + run flow
│   ├── dashboard/
│   │   ├── tools/                  ← Create and manage tools
│   │   ├── earnings/               ← Balance and withdrawals
│   │   └── settings/               ← Payout email
│   └── api/
│       ├── tools/[toolId]/run/     ← POST: create run (public)
│       ├── runs/[runId]/           ← GET: poll result (public)
│       ├── withdrawals/            ← POST: creator withdrawal
│       └── webhooks/locus/         ← POST: payment confirmed
├── lib/
│   ├── locus.ts                    ← All Locus API calls (raw fetch)
│   ├── auth.ts                     ← Auth.js config
│   └── db.ts                       ← Prisma client
└── scripts/
    └── agent-demo.ts               ← Autonomous agent demo
```

---

## Revenue Model

- **Platform fee:** 20% of every run
- **Creator earnings:** 80% of every run, accumulated in dashboard balance
- **Withdrawals:** On-demand via Pay With Locus `send-email` — USDC sent to 
  creator's email, claimed via Locus escrow. No prior crypto account needed.
- **AI execution cost:** ~$0.001–$0.005 per run via Locus Wrapped Anthropic API 
  (Claude Haiku), deducted from platform Locus credits

---

## Future Plans

### Near-term
- **Tool discovery API** (`GET /api/tools`) with full `inputSchema` exposure, 
  enabling any external agent to discover and use tools programmatically without 
  prior knowledge of the platform
- **Per-run immediate payouts** — send creator 80% directly after each webhook 
  confirmation rather than batching, eliminating the custodial holding period
- **Tool versioning** — creators can update their system prompt without breaking 
  existing integrations; buyers always run the latest published version

### Medium-term
- **File input support** — allow PDF and document uploads as tool inputs, 
  unlocking contract review for full documents, code review for entire files, 
  and report analysis
- **Tool ratings and reviews** — buyers rate runs after completion, surfacing 
  quality tools and penalizing low-quality ones
- **Creator analytics** — per-tool run analytics, input pattern analysis 
  (what are buyers actually typing), conversion rate from tool view to run
- **Agent marketplace listing** — a dedicated section where agents list themselves 
  as buyers with their capabilities, allowing tool creators to target specific 
  agent use cases

### Long-term
- **Real-time payment splitting** — work with Locus to implement session-level 
  revenue splits, eliminating the custodial model entirely. Creator receives 
  their 80% on-chain simultaneously with the platform fee, no trust required
- **Multi-model support** — let creators choose the model powering their tool: 
  Claude Haiku (fast, cheap), Claude Sonnet (higher quality, higher price), 
  GPT-4o, Gemini — all via Locus Wrapped APIs. Price adjusts accordingly.
- **Agent-to-agent marketplace** — tools that take other tools as inputs, 
  enabling agents to compose multi-step workflows by chaining Invoke Studio 
  tools together, each paying per call autonomously
- **Subscription tools** — creators offer monthly access to a tool at a fixed 
  USDC price rather than per-run, better for high-frequency users

---

## License

MIT

---

*Built by Yusuf Lawal ([@dev_lawal](https://x.com/dev_lawal)) for the 
Locus Paygentic Hackathon — Week 3.*  
*Powered by [Locus](https://paywithlocus.com).*