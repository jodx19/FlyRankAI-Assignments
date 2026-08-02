# Assignment: Ship an Automation Workflow v2

**Track:** General AI Fluency
**Code:** FL-08 | **Phase:** Build (Week 4)
**Developer:** Mahmoud Mostafa El Safi
**Pipeline Focus:** Automated Technical Case Study Generator (From Raw C#/.NET Commits to Portfolio Markdown)

---

## 📐 1. Workflow Architecture & Step Diagram

```text
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 1: Gather & Extract (Claude / NotebookLM Context)                  │
│ Input: Raw Commit Logs, C# Class Files, Architecture Notes             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Structural Draft & Synthesis (Custom Claude Prompt Directive)  │
│ Process: Map code logic into Architectural Intent, Clean Code & SOLID  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 3: Technical Critique, Edge Cases & Verification (Review Agent)   │
│ Process: Verify C# syntax accuracy, benchmark claims & security checks  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Standardized Output (Portfolio Ready Markdown Format)          │
│ Output: Structured Case Study with Identity Kit Hex Codes (#0D9488)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Configuration & Directives Used

### **Step 1 Directive (Gathering):**
> *"Extract core architectural intent, database schema changes, and software patterns used from the raw C# code/commit diffs provided. Ignore syntax noise."*

### **Step 2 Directive (Drafting):**
> *"Structure the technical details into: Problem Context, Implementation Pattern (.NET/MediatR/EF Core), Performance Benefits, and Trade-offs."*

### **Step 3 Directive (Reviewer Agent Prompt):**
> *"Critique the draft like a Senior .NET Architect. Highlight any false performance claims, invalid C# code snippets, or missing validation steps."*

---

## 🧪 3. Documented 5 Real Test Runs

| Run # | Input Project / Feature | Input Data Provided | Automated Output Generated | Human Edits Needed |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **SaaS Usage Quotas Framework** | MediatR pipeline code & tenant limit configs | Complete Markdown case study with pipeline diagrams | Fixed minor DB query naming in C# snippet |
| **2** | **Hospital Information System (HIS)** | Auth & Authorization RBAC module code | Structured security overview & EF Core entity relation chart | Verified JWT token refresh flow logic |
| **3** | **Doctor Consultation Module** | Doctor schedule availability controller & services | Clean API endpoint summary & Postman sample schema | None (Pass) |
| **4** | **EF Core + PostgreSQL Container** | `docker-compose.yml` & Migration C# scripts | Containerized database setup guide & connection pooling notes | Corrected environment variable placeholder |
| **5** | **Angular Frontend Error Interceptor** | TypeScript Interceptor & RxJS catchError pipe | Frontend resilience case study for backend error codes | None (Pass) |

---

## ⏱️ 4. Time Accounting & Savings (Honest Metrics)

* **Setup & Directive Engineering Cost:** `45 minutes` (One-time investment).
* **Manual Case Study Writing Time:** `~90 minutes` per project.
* **Automated Workflow Execution Time:** `~6 minutes` per project (including prompt execution and layout verification).

### **Total Time Saved for 5 Case Studies:**
* **Manual Effort (5 runs):** `5 × 90 mins = 450 minutes (7.5 hours)`
* **Automated Workflow (5 runs + setup):** `45 mins (setup) + (5 × 6 mins) = 75 minutes (1.25 hours)`
* 🚀 **Net Time Saved:** **375 minutes (~6.25 Hours / ~83% Efficiency Gain)**

---

## ⚠️ 5. Failure Points & Required Human Review

1. **Hallucinated Framework Methods:** The LLM occasionally suggests C# framework extensions that do not exist in standard EF Core or ASP.NET Core without specific version prompts.
2. **Security Leakage:** Human review is **mandatory** to ensure database connection strings, secret keys, or private internal IP addresses from commit logs are stripped out before publishing.
3. **Over-promising Benchmarks:** AI tends to claim *"sub-millisecond performance"* automatically; a human developer must verify true execution metrics against benchmark logs.
