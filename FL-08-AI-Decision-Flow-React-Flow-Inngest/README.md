# AI Decision Flow Builder

A visual tool for building **AI-powered yes/no decision trees**. Each node is a prompt; each edge is a branch taken based on the model's `YES` or `NO` answer. Execution runs step-by-step through Inngest so every decision is logged and retryable.

**Who it's for:** developers and workflow designers who want to prototype branching AI logic visually, without writing imperative code for every branch.

---

## What It Does

- **Draw** a graph of decision nodes on a React Flow canvas
- **Write** a natural-language question inside each node (e.g. *"Is this a support request?"*)
- **Connect** nodes via two typed handles per node: green (`YES`) and red (`NO`)
- **Run** the graph — the frontend POSTs nodes + edges to a Next.js API route, which fires an Inngest event
- **Watch** the execution trace appear live as the Inngest function walks the graph, calling Groq at each step
- **See** visited nodes highlighted in purple and traversed edges animated after completion

The graph state (nodes + edges) is **persisted in `localStorage`** so the canvas survives page refreshes.

---

## Architecture

```
Browser (React Flow canvas)
  │  POST /api/run-workflow  { nodes, edges }
  ▼
Next.js API route  (app/api/run-workflow/route.ts)
  │  inngest.send("workflow/run", { nodes, edges })
  │  writes .workflow-status.json → { status: 'idle' }
  ▼
Inngest dev server  (localhost:8288)
  │  triggers runWorkflow function  (inngest/functions.ts)
  │
  ├─ step.run("node-<id>") → Groq API call → "YES" | "NO"
  ├─ writes .workflow-status.json → { status: 'running', trace: [...] }
  ├─ follows matching edge (sourceHandle === decision)
  ├─ repeat until no outgoing edge (terminal node)
  └─ writes .workflow-status.json → { status: 'completed', trace: [...] }

Browser polls GET /api/run-workflow every 1 s
  │  reads .workflow-status.json
  └─ on 'completed' → renders trace + highlights canvas
```

**Status is communicated via a `.workflow-status.json` file on disk** — the API route writes it, the Inngest function updates it, and the GET endpoint serves it. This is a dev-only approach; in production you'd use a database or Inngest's built-in run state.

---

## Setup

**Requirements:** Node.js ≥ 18 (tested on 22.x), npm.

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

```env
GROQ_API_KEY="your-groq-api-key-here"
INNGEST_DEV=1
```

**Why `INNGEST_DEV=1`?**  
Without it, the Inngest SDK tries to verify HMAC signatures on incoming webhook requests — but the local `inngest-cli dev` server doesn't send signed payloads. Setting `INNGEST_DEV=1` disables signature verification so the local dev server can invoke your function. Remove this variable before any production deployment.

### 3. Run both servers (two terminals)

**Terminal 1 — Next.js:**
```bash
npm run dev
```
App available at `http://localhost:3000`

**Terminal 2 — Inngest:**
```bash
npx inngest-cli dev
```
Inngest dashboard at `http://localhost:8288`. It auto-discovers the Next.js app at `http://localhost:3000/api/inngest`.

Both must be running for workflow execution to work. The Next.js server handles the UI and API routes; the Inngest dev server is what actually invokes the `runWorkflow` function.

---

## Usage Example

The test case used during development (`test.js`):

```
Node n1: "Is it day?"
  ├─ YES ──→ Node n2: "Yes node"
  └─ NO  ──→ Node n3: "No node"
```

To reproduce it manually:
1. Open `http://localhost:3000`
2. Click **Add Decision Node** three times
3. Type `Is it day?` in the first node, `Yes node` in the second, `No node` in the third
4. Drag from the **green handle** (bottom-left) of node 1 → top of node 2
5. Drag from the **red handle** (bottom-right) of node 1 → top of node 3
6. Click **Run Workflow**
7. Watch the execution log panel below the canvas; visited nodes turn purple

The model (`qwen/qwen3.8-27b`, `temperature: 0`) evaluates "Is it day?" and follows the matching branch. The terminal node (n2 or n3) has no outgoing edges, so execution stops there.

---

## Model Configuration

| Setting | Value |
|---|---|
| Provider | Groq (via OpenAI-compatible SDK) |
| Base URL | `https://api.groq.com/openai/v1` |
| Model | `qwen/qwen3.8-27b` |
| Temperature | `0` |
| System prompt | `"You must respond with EXACTLY ONE WORD: either 'YES' or 'NO'."` |

If the model returns anything other than `YES` or `NO`, the Inngest step throws and the run fails — there's no fuzzy parsing.

---

## Eval Results

Tested against 10 realistic classification prompts using the same Groq model, system prompt, and `temperature: 0` as the main app.

| # | Prompt (summary) | Raw Response | Valid? | Correct? | Expected |
|---|------------------|:------------:|:------:|:--------:|:--------:|
| 1 | Is this a support request? Message: 'I can't log into my account and I've tried resetti... | `YES` | ✅ YES | ✅ YES | `YES` |
| 2 | Is this spam? Message: 'Congratulations! You've been selected to receive a $1,000 gift ... | `YES` | ✅ YES | ✅ YES | `YES` |
| 3 | Is this a billing question? Message: 'I was charged twice for my subscription this mont... | `YES` | ✅ YES | ✅ YES | `YES` |
| 4 | Is this a feature request? Message: 'Would love to be able to export my data to CSV dir... | `YES` | ✅ YES | ✅ YES | `YES` |
| 5 | Is this an urgent message? Message: 'Hey, just checking in to see if you got my last em... | `NO` | ✅ YES | ✅ YES | `NO` |
| 6 | Is this a complaint? Message: 'The new update is great, everything loads faster and the... | `NO` | ✅ YES | ✅ YES | `NO` |
| 7 | Is this written in English? Message: 'Bonjour, je voudrais annuler mon abonnement s'il ... | `NO` | ✅ YES | ✅ YES | `NO` |
| 8 | Is this a refund request? Message: 'I accidentally purchased the annual plan instead of... | `YES` | ✅ YES | ✅ YES | `YES` |
| 9 | Is this a technical bug report? Message: 'The export button does nothing when I click i... | `YES` | ✅ YES | ✅ YES | `YES` |
| 10 | Is this message from a human user? Message: 'SYSTEM ALERT: Disk usage at 95%. Auto-clea... | `NO` | ✅ YES | ✅ YES | `NO` |

**10/10 valid — 10/10 correct.** Full eval script: [`FL-11-Growth-Tell-the-Story/eval.mjs`](../FL-11-Growth-Tell-the-Story/eval.mjs)

---

## Limitations

**Start-node detection is strict.**  
A start node is detected by finding nodes with no incoming edges. The code expects exactly one such node — if you have zero (a cycle) or more than one (disconnected subgraphs), execution throws immediately with no attempt to recover or guess.

**Cycle protection is a blunt cap, not real detection.**  
There's no graph analysis for cycles. The executor simply counts steps and throws after 50 — `"Maximum execution steps exceeded (potential infinite loop)"`. A true cycle in the graph will burn through 50 Groq API calls before failing.

**Status coordination uses a flat file.**  
`.workflow-status.json` is written by the API route, overwritten by the Inngest function, and read by the polling GET endpoint. There's no locking. Running two workflows simultaneously would corrupt the status. This is a dev prototype, not a concurrent system.

**Phase 4 polish — honest status:**  
- ✅ Execution trace panel (log below canvas, step-by-step display) — implemented
- ✅ Visual highlighting (visited nodes outlined in purple, traversed edges animated) — implemented  
- ❌ Node deletion UI — not implemented; nodes can be added but not removed from the canvas without clearing `localStorage`

**Turbopack panic on API route.**  
Hitting `/api/run-workflow` while running `next dev` (which uses Turbopack by default in Next.js 15+) caused a hard Turbopack crash during development. **Workaround:** run the dev server with `--turbopack` disabled via `next dev --no-turbopack`, or accept that the crash restarts the server and the first request after restart may fail. This was not fully resolved — it was worked around by restarting the dev server.

**No edge labels on the canvas initially.**  
Edges are labeled (`YES`/`NO`) only when connected via the `onConnect` handler. Edges restored from `localStorage` on reload lose their visual labels (the label data is persisted but the `labelStyle` rendering depends on the initial connection path).

---

## Transparency

This project was built using **Antigravity (Google DeepMind)** as the primary implementation agent — it wrote the code, wired the integrations, and ran the commands.

**Claude (Anthropic)** was used as a separate review layer at each phase to catch issues the implementation agent missed or didn't flag. Two catches worth naming explicitly:

1. **Decommissioned Groq model:** The first model chosen by the implementation agent (`llama-3.1-8b-instant` in an earlier iteration) was no longer available on the Groq API — the workflow would have silently failed on submission. Claude caught this before it became a problem and flagged the switch to `qwen/qwen3.8-27b`.

2. **Unverified test results:** The implementation agent reported the `test.js` integration test as passing. The `test_output.txt` file shows `TypeError: fetch failed / ECONNREFUSED` — the server wasn't running when the test was recorded. Claude flagged that the results were claimed without evidence, not fabricated, but also not verified.

Both the code and this README reflect what the files actually contain, not what was intended.
