import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const creator = await db.user.upsert({
    where: { email: "olaoluwalawal19@gmail.com" },
    update: {},
    create: {
      email: "olaoluwalawal19@gmail.com",
      name: "Invoke Studio Team",
      image: "https://api.dicebear.com/7.x/initials/svg?seed=IF&backgroundColor=0ea5e9",
      payoutEmail: "olaoluwalawal19@gmail.com",
    },
  });

  const tools = [
    {
      name: "Contract Risk Scanner",
      slug: "contract-risk-scanner",
      description:
        "Paste any business contract and get a structured breakdown of risky clauses, missing protections, and specific negotiation points. Built for freelancers and small business owners.",
      category: "LEGAL" as const,
      priceUsdc: 0.75,
      exampleOutput:
        "## Contract Risk Analysis\n\n### 🔴 RED FLAGS\n**Clause 4.2 — Unlimited Liability**\nThis clause holds you liable for indirect and consequential damages with no cap. Negotiate a liability cap equal to the total contract value.\n\n**Clause 7.1 — Blanket IP Assignment**\nAll work product including your pre-existing tools transfers to the client. Limit to deliverables created specifically for this project.\n\n### 🟡 MISSING PROTECTIONS\n- No payment terms or late penalties\n- No kill fee for mid-project cancellation\n- No dispute resolution clause\n\n### 💬 NEGOTIATION POINTS\n1. Clause 4.2: Replace with 'Liability limited to total fees paid under this agreement'\n2. Clause 7.1: Add 'excluding Contractor's pre-existing tools, frameworks, and methodologies'",
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
      description:
        "Paste a function or module and get a focused security audit: vulnerabilities ranked by severity, each with a patched version. Works for any language.",
      category: "CODE" as const,
      priceUsdc: 0.65,
      exampleOutput:
        "## Security Audit\n\n### CRITICAL\n**SQL Injection — Line 23**\n`query = 'SELECT * FROM users WHERE email = ' + email`\nDirect string concatenation allows injection. Patched:\n```python\ncursor.execute('SELECT * FROM users WHERE email = %s', (email,))\n```\n\n### HIGH\n**Missing input validation — Line 41**\nNo length check on amount field before payment processing. Add: `if not 0 < amount <= 10000: raise ValueError`\n\n### LOW\n**Hardcoded timeout — Line 89**\nMove to environment config for flexibility without redeployment.",
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
      description:
        "Get an honest, investor-level critique of your startup pitch. Know the exact pushback questions before you're in the room.",
      category: "BUSINESS" as const,
      priceUsdc: 0.75,
      exampleOutput:
        "## Pitch Critique\n\n### What's Working\nThe problem is clearly defined. The 'verified student' angle is a genuine moat that's easy to explain and hard to replicate.\n\n### What Investors Will Push Back On\n**'Why hasn't this worked before?'**\nYou need a clear answer to why previous campus marketplace attempts failed.\n\n### The One Unanswered Question\nWhat does 'verified student' mean in practice? How do you verify?\n\n### Suggested Rewrites\nChange: 'We're building a campus marketplace'\nTo: 'We're building the economic infrastructure for campus life'",
      systemPrompt: `You are a partner at a top-tier VC firm with 12 years evaluating early-stage startups. You are direct, skeptical, and helpful.

Analyze the provided startup pitch and produce:

### What's Working
2-3 specific strengths. Be brief.

### What Investors Will Push Back On
3-5 hardest questions this pitch will face. For each: the exact question, why it's a problem, a specific answer the founder should prepare.

### The One Unanswered Question
The single most important thing missing.

### Suggested Rewrites
2-3 specific lines that should change, with exact replacement language.

Be direct. Do not soften bad feedback.`,
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
      description:
        "Generate a polished monthly investor update from your raw metrics and notes. Concise, structured, the way investors actually want to read it.",
      category: "WRITING" as const,
      priceUsdc: 0.35,
      exampleOutput:
        "Subject: Invoke Studio — April Update\n\nHi everyone,\n\nQuick update for April.\n\n**The headline:** Crossed 100 tool creators and $2,400 in GMV. The surprise: 30% of all runs are now from AI agents.\n\n**What's working:** Agent adoption is moving faster than expected.\n\n**What's not:** Creator onboarding drop-off is too high. 45% start the flow and don't finish.\n\n**This month:** Simplify the creation flow. Outreach to 50 dev newsletters.\n\n**Ask:** Intros to anyone running an AI-native developer tools fund.\n\nYusuf",
      systemPrompt: `You are an experienced startup founder writing a monthly investor update. Investors skim these. You write with clarity, honesty, and specificity.

Write a monthly investor update email with:
1. Subject line: "[Company] — [Month] Update"
2. One opening sentence capturing the most important thing
3. Structure: The headline | What's working | What's not | This month's priorities | Ask (if provided)
4. Honest about what's not working
5. Specific numbers wherever provided
6. 250-350 words maximum
7. Tone: direct, professional, human

Do not use "excited to share" or "thrilled to announce."`,
      inputSchema: [
        { id: "company", label: "Company Name", type: "text", placeholder: "e.g. Invoke Studio", charLimit: 100, required: true },
        { id: "metrics", label: "Key metrics this month", type: "textarea", placeholder: "e.g. MRR: $1,200 (+18% MoM), Active users: 340", charLimit: 400, required: true },
        { id: "wins", label: "Biggest wins", type: "textarea", placeholder: "What went well? Specific milestones, partnerships, launches...", charLimit: 400, required: true },
        { id: "blockers", label: "What's not working", type: "textarea", placeholder: "Be honest. What's behind plan?", charLimit: 400, required: true },
        { id: "priorities", label: "Top priorities next month", type: "textarea", placeholder: "What are you focused on?", charLimit: 300, required: true },
        { id: "ask", label: "Your ask (optional)", type: "text", placeholder: "e.g. Intros to fintech founders", charLimit: 300, required: false },
      ],
    },
    {
      name: "Unit Economics Analyzer",
      slug: "unit-economics-analyzer",
      description:
        "Input your key business metrics and get a clear health diagnosis: key ratios vs benchmarks, danger zones, and exactly what to fix first.",
      category: "FINANCE" as const,
      priceUsdc: 0.65,
      exampleOutput:
        "## Unit Economics Analysis\n\n### Overall Health: ⚠️ At Risk\n\nYour LTV:CAC of 1.8x is below the 3x minimum.\n\n### Key Ratios\n| Metric | Yours | Benchmark | Status |\n|--------|-------|-----------|--------|\n| LTV:CAC | 1.8x | >3x | 🔴 |\n| Payback Period | 18mo | <12mo | 🟡 |\n| Gross Margin | 62% | >60% | ✅ |\n\n### The Core Problem\nChurn is destroying LTV. At 4.2% monthly churn your average customer stays 24 months.\n\n### Fix This First\n1. Reduce monthly churn 4.2% → 2%\n2. Reduce CAC from $240 → $180\n3. Do NOT raise prices until churn is fixed",
      systemPrompt: `You are a CFO specializing in SaaS and marketplace businesses. You give founders the honest truth about their unit economics.

Analyze the provided metrics and produce:

### Overall Health
One of: ✅ Healthy | ⚠️ At Risk | 🔴 Critical
One sentence diagnosis.

### Key Ratios
A table: metric | their number | industry benchmark | status (✅/🟡/🔴).
Calculate LTV:CAC, payback period, and other relevant ratios.

### The Core Problem
The single most important thing that's wrong.

### Fix This First
3 specific, prioritized recommendations.

Use plain language. Be direct.`,
      inputSchema: [
        { id: "model", label: "Business Model", type: "text", placeholder: "e.g. B2B SaaS monthly subscription", charLimit: 100, required: true },
        { id: "cac", label: "Customer Acquisition Cost (CAC)", type: "text", placeholder: "e.g. $240", charLimit: 100, required: true },
        { id: "arpu", label: "Average Revenue Per User / Month", type: "text", placeholder: "e.g. $45/month", charLimit: 100, required: true },
        { id: "churn", label: "Monthly Churn Rate", type: "text", placeholder: "e.g. 3.5%", charLimit: 100, required: true },
        { id: "margin", label: "Gross Margin", type: "text", placeholder: "e.g. 68%", charLimit: 100, required: true },
        { id: "context", label: "Additional context (optional)", type: "textarea", placeholder: "Stage, what you're optimizing for...", charLimit: 400, required: false },
      ],
    },
    {
      name: "Database Schema Reviewer",
      slug: "database-schema-reviewer",
      description:
        "Paste your Prisma schema or SQL DDL and get a focused review: missing indexes, normalization issues, N+1 risks, and security concerns — with exact fixes.",
      category: "CODE" as const,
      priceUsdc: 0.60,
      exampleOutput:
        "## Schema Review\n\n### 🔴 Critical\n**Missing index on posts.userId**\nEvery query filtering posts by user does a full table scan.\nFix: add `@@index([userId])` to the Post model.\n\n### 🟡 Design Issues\n**address stored as single string in User**\nBlocks filtering by city/country. Split into: street, city, state, country, postalCode.\n\n### ✅ What's Good\n- cuid() IDs used correctly\n- Cascade deletes set correctly",
      systemPrompt: `You are a senior database engineer with deep expertise in PostgreSQL and Prisma ORM.

Analyze the provided schema and produce:

### 🔴 Critical
Issues that will cause real problems: missing indexes, missing constraints, data types causing overflow, security issues.

### 🟡 Design Issues
Normalization problems, inefficient structures, missing soft delete patterns.

### ✅ What's Good
2-3 things done correctly.

### Recommended Additions
Exact Prisma or SQL additions. Ready to copy-paste.

Reference model names and field names. Explain WHY each issue matters.`,
      inputSchema: [
        { id: "schema", label: "Schema", type: "textarea", placeholder: "Paste your full Prisma schema or SQL DDL here...", charLimit: 6000, required: true },
        { id: "orm", label: "ORM / Database", type: "text", placeholder: "e.g. Prisma + PostgreSQL", charLimit: 100, required: true },
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
