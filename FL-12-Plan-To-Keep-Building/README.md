# FL-12: Plan to Keep Building

**Track:** General AI Fluency — Week 8
**Developer:** Mahmoud Mostafa El Safi
**Deliverable type:** Continuous Growth Plan

---

## 1. How to Add the Next Case Study

> Quick-reference for myself — not docs for a stranger.

### Where it goes

New route: `/work/<slug>`
Angular component: `src/app/work/<slug>/<slug>.component.ts`
Wire it in `WorkModule` route config alongside the existing `saas-quotas` and `his-system` entries.
Also: add a card to the Home page case-study section (between section 2 and 3 in the content map), and update the previous case's "Next Case →" footer link to point here.

### Steps

1. `ng g c work/<slug>` — Angular creates the component and its files.
2. Fill it with the **three-beat shape**:
   - **Problem** — one sentence: what was broken or missing, and why it mattered.
   - **What I did** — two or three sentences on the specific technical choice (architecture pattern, tool, key decision).
   - **What came of it** — a number or concrete outcome if available; if not, what it *proves* you can do.
3. Add the card on Home → `[Read Case Study]` CTA pointing to `/work/<slug>`.
4. Update the previous case's bottom footer link: `Next Case: <New Title> →`.
5. Commit and push — Vercel deploys automatically.

### Design tokens to keep

| Token | Value |
|---|---|
| Heading font | `JetBrains Mono`, Bold 700 / SemiBold 600 |
| Body font | `Inter`, Regular 400 / Medium 500 |
| Primary accent | `#0D9488` (Teal 600) |
| Text (near-black) | `#0F172A` (Slate 900) |
| Background | `#F8FAFC` (Slate 50) |
| Border / muted | `#E2E8F0` (Slate 200) |

No new colours. No new fonts. The tokens live in `FL-03-Build-Your-Identity-Kit/Readme.md` — don't drift from them.

---

## 2. Next Real Piece of Work

**Selected project:** AI Decision Flow Builder
**Slug:** `/work/ai-decision-flow`
**Source:** `FL-08-AI-Decision-Flow-React-Flow-Inngest`

### Three-beat frame (ready to paste into the component)

**Problem:** There was no visual way to prototype branching AI logic without writing imperative code for every decision branch — every workflow had to be hardcoded before it could be tested.

**What I did:** Built a React Flow canvas where each node holds a natural-language prompt; connected it to an Inngest function that walks the graph step-by-step, calling Groq at each node and branching on its `YES` / `NO` answer. Wired a polling API to stream the live execution trace back to the canvas and highlight visited nodes.

**What came of it:** 10/10 eval accuracy across realistic classification prompts at `temperature: 0`. Full execution trace visible in real time. Graph persisted across reloads. Shipped with an honest limitations section: flat-file status coordination, a 50-step cycle cap, and no edge deletion UI — documented, not hidden.

---

## 3. Recurring Reminder — October 2026

**Next review date:** 1 October 2026
**Calendar note (copy this in):**

> "FL-12 review: ship the AI Decision Flow case study page. Check if a new piece of work is ready to name as Case 4. Update Home card order if needed."

**Reminder set via:** Google Calendar / iOS Calendar — recurring annually every October 1st.

---

## 4. Build Context Snapshot (so future additions are cheap)

Preserving this here so the Claude Project / AI assistant doesn't need to re-derive context from scratch next time:

- **Stack:** Angular 19, deployed on Vercel, zero backend (static SPA).
- **Content map source:** `FL-05-Map-Content-And-CTAs/README.md`
- **Identity kit source:** `FL-03-Build-Your-Identity-Kit/Readme.md`
- **Case framing pattern source:** `FL-03-Frame-It-As-Cases/README.md`
- **Existing case routes:** `/work/saas-quotas`, `/work/his-system`
- **Next case route:** `/work/ai-decision-flow`
- **Three-beat shape:** Problem → What I did → What came of it (same pattern across all cases, always).
- **No new dependencies needed** for a new case study — it's a static Angular component with the existing design system.

---

## ✅ Submission Checklist

- [x] Concrete "how to add the next case" note written — specific route, steps, and token reference.
- [x] Next real project named: **AI Decision Flow Builder** (`/work/ai-decision-flow`).
- [x] Three-beat frame written and ready to paste.
- [x] Calendar reminder set for October 1, 2026.
- [x] Build context preserved — future additions require no research, just the steps above.
