# 🏗️ Harness Engineering: Backend Systems with AI

> **The Shift from Writing Code to Building the Harness**  
> A comprehensive engineering document covering all 9 learning points from the FlyRank Harness Engineering course, with practical application on `.NET Core`, `Clean Architecture`, and `Docker`.

---

## 📑 Table of Contents

1. [The Shift — What Changed in the Job](#1-the-shift--what-changed-in-the-job)
2. [Context is Memory — The Agent Forgets Everything](#2-context-is-memory--the-agent-forgets-everything)
3. [The Knowledge Layer — README as a Map](#3-the-knowledge-layer--readme-as-a-map)
4. [The Spec Layer — Plans a Stranger Could Execute](#4-the-spec-layer--plans-a-stranger-could-execute)
5. [The Loop — One Line of Bash](#5-the-loop--one-line-of-bash-that-turns-a-spec-into-shipped-tasks)
6. [Trust — Tests, Gates & Circuit Breakers](#6-trust--tests-gates--circuit-breakers)
7. [The Codebase as the Interface — Naming, Types & Rules](#7-the-codebase-as-the-interface--naming-types--rules)
8. [Running Many — Parallel Agents Without Chaos](#8-running-many--parallel-agents-without-chaos)
9. [What Stays Human — Thinking, Priorities & Catching AI Wrong](#9-what-stays-human--thinking-priorities--catching-ai-wrong)
10. [Personal Actionable Rules](#10-personal-actionable-rules)

---

## 1. The Shift — What Changed in the Job

### Before vs Now

| Before (Traditional Developer) | Now (Harness Engineer) |
|-------------------------------|------------------------|
| Writes every line of code yourself | Writes the plans, rules & checks that let AI write the code |
| Spends hours debugging runtime errors | Spends time designing specifications that prevent errors |
| Types boilerplate manually | Builds reusable scaffolds & templates |
| Single-threaded — can only write one thing at a time | Runs multiple AI agents in parallel |
| Memorizes every API detail | Documents knowledge so AI can use it instantly |

### The Core Insight

> **Every app you use is mostly backend:** the part that receives requests, checks who is asking, talks to the database, runs slow work in the background, and never loses your data. You have been building exactly that for three weeks. Now AI can type most of the code — which means the job is changing from writing code to building the **harness** around the AI.

### 🔑 Key Principle

```
Harness = Plans + Rules + Checks   →   AI writes the code   →   Harness catches it when wrong
```

---

## 2. Context is Memory — The Agent Forgets Everything

### Why This Matters Most

> **The AI agent forgets everything between conversations.** Every new chat is a blank slate. This single fact drives everything else in Harness Engineering.

### The Memory Problem

```
Conversation 1: "Build a User CRUD with Clean Architecture"
  → AI writes perfect code with proper layering

Conversation 2: "Add an Order endpoint"
  → AI has NO memory of the project structure
  → Writes flat code, wrong namespaces, missing dependencies
```

### The Solution: External Memory

| What the AI needs | Where you store it |
|-------------------|-------------------|
| Project structure & conventions | `README.md` |
| Architecture rules & patterns | `.rules/` or `SPEC.md` |
| Coding standards | `.editorconfig`, `Directory.Build.props` |
| Current task context | `SPEC.md` per task |

### 🔑 Key Principle

```
Your project files are the AI's memory.
If it's not in the files, the AI doesn't know it.
```

### Practical Rule

> **Every session starts with: "Read the README.md"** — this loads the project context into the AI's context window.

---

## 3. The Knowledge Layer — README as a Map

### What Makes a README "Work Like a Map"

A good README for AI is different from a good README for humans. It must be:

1. **Parsable** — structured so AI can extract facts quickly
2. **Complete** — no implicit knowledge; everything the AI needs to know is written
3. **Current** — outdated knowledge is worse than no knowledge

### AI-Optimized README Structure

```markdown
# Project Name

## 📋 Identity
- **Project**: Backend API for [Domain]
- **Stack**: .NET 8, Clean Architecture, Docker, PostgreSQL, Redis
- **Pattern**: CQRS with MediatR

## 🏗️ Project Structure
```
src/
├── Domain/           # Entities, Value Objects, Interfaces
│   └── Entities/
│   └── ValueObjects/
│   └── Interfaces/
├── Application/      # Use Cases, DTOs, Mapping
│   └── Features/
│   └── Common/
├── Infrastructure/   # EF Core, Repositories, External Services
│   └── Persistence/
│   └── Services/
└── WebAPI/          # Controllers, Middleware, Filters
    └── Controllers/
    └── Middleware/
```

## 🧱 Architecture Rules
- Domain layer has ZERO dependencies on other projects
- Application layer depends only on Domain
- Infrastructure implements Domain interfaces
- WebAPI is the entry point; depends on Application & Infrastructure

## 📐 Conventions
- Use records for DTOs and Commands
- Use sealed classes for Use Case handlers
- FluentValidation for input validation
- AutoMapper for Entity → DTO mapping
```

### Docs an Agent Can Actually Use

- **Avoid walls of text** — use bullet points, tables, and code examples
- **Be explicit** — don't say "follow best practices", say "every Use Case must have a corresponding Unit Test"
- **Include example files** — show a real `appsettings.json`, real `Dockerfile`, real `Program.cs`

---

## 4. The Spec Layer — Plans a Stranger Could Execute

### The Principle

A good SPEC is so detailed that **a stranger who has never seen your codebase** could execute it, and **you can verify when it's done** without reading the code.

### SPEC.md Template

```markdown
# Feature: CreateProduct

## 🎯 Goal
Allow authenticated users to create a new product in the catalog.

## 📋 Acceptance Criteria
- [ ] POST /api/products accepts valid product data
- [ ] Returns 201 Created with the product ID
- [ ] Returns 400 Bad Request for invalid data
- [ ] Returns 401 Unauthorized for unauthenticated requests
- [ ] Product is persisted in PostgreSQL
- [ ] ProductCreatedEvent is published to message bus

## 🧱 Technical Design

### Domain Layer
- **Entity**: `Product` (Name, Price, CategoryId, CreatedAt)
- **Value Object**: `Money` (Amount, Currency)
- **Interface**: `IProductRepository`

### Application Layer
- **Command**: `CreateProductCommand` (Name, Price, CategoryId)
- **Handler**: `CreateProductCommandHandler`
- **DTO**: `ProductResponseDto` (Id, Name, Price)

### Infrastructure Layer
- **Repository**: `ProductRepository` (EF Core)
- **Migration**: `Create_Products_Table`

### WebAPI Layer
- **Endpoint**: `POST /api/products`
- **Validation**: `CreateProductValidator`
- **Mapping**: `ProductProfile` (AutoMapper)

## ✅ Testing
- Unit: CreateProductHandlerTests (success, validation failure)
- Integration: ProductRepositoryTests (CRUD operations)
- Health: DatabaseHealthCheck updates

## 🔗 Dependencies
- Product domain entity (already exists)
- Category entity (already exists)
```

### A "Done" You Can See

- **All acceptance criteria checked** — not a feeling, a checklist
- **Tests pass** — not "seems to work", but `dotnet test --no-build` returns green
- **SPEC is reviewed** — someone else reads the SPEC and confirms it matches the result

---

## 5. The Loop — One Line of Bash That Turns a Spec Into Shipped Tasks

### The Core Automation

> The entire Harness Engineering workflow can be triggered by **one line of bash** that:
> 1. Takes a SPEC file as input
> 2. Feeds it to an AI agent with context from README
> 3. The AI generates code
> 4. Tests run automatically
> 5. If tests pass → code is ready. If tests fail → AI retries.

### The One-Liner (Concept)

```bash
# The loop: SPEC → AI → Code → Test → Done or Retry
cat specs/CreateProduct.md | ai-agent --context README.md --test "dotnet test" --retry 3
```

### What Happens Inside the Loop

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  SPEC.md    │────>│  AI Agent   │────>│  Generate   │────>│  Run Tests  │
│  (Input)    │     │  (LLM)      │     │  Code       │     │  dotnet test│
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                            ┌───────────────────────┘
                                            ▼
                                    ┌─────────────┐     ┌─────────────┐
                                    │  Tests Pass │────>│   ✅ DONE   │
                                    │  ?          │     │  (PR Ready) │
                                    └──────┬──────┘     └─────────────┘
                                           │ No
                                           ▼
                                    ┌─────────────┐
                                    │  Retry AI   │────> Back to AI
                                    │  with error  │
                                    └─────────────┘
```

### The Retry Strategy

1. **First attempt**: AI reads SPEC + README, writes code
2. **If tests fail**: Feed the test output back to AI as error context
3. **Second attempt**: AI fixes code based on error
4. **If tests still fail**: Human intervenes — the harness caught something the AI couldn't fix

### 🔑 Key Principle

> **The loop cannot lie about being done** — because "done" is defined by passing tests, not by code existing.
> **The loop cannot run forever** — because retry limits force human intervention.

---

## 6. Trust — Tests, Gates & Circuit Breakers

### The Trust Problem

AI writes code confidently, even when wrong. The harness must verify:

1. **Does the code compile?** → Build gate
2. **Does it work correctly?** → Test gate
3. **Is the system healthy?** → Health check gate

### The Gates (Enforced in CI/CD)

```yaml
# .github/workflows/ci.yml
gates:
  - name: Build
    command: dotnet build --no-restore
    failure: "Stop — code doesn't compile"
    
  - name: Unit Tests
    command: dotnet test --no-build --filter "Category=Unit"
    failure: "Stop — logic is broken"
    
  - name: Integration Tests
    command: dotnet test --no-build --filter "Category=Integration"
    failure: "Stop — system interaction failed"
    
  - name: Health Checks
    command: curl -f http://localhost:5000/health/ready
    failure: "Stop — service is unhealthy"
```

### Circuit Breaker in Practice

```
                    ┌──────────────┐
          ┌────────>│  🟢 Healthy  │<────────┐
          │         │  (Normal)    │         │
          │         └──────┬───────┘         │
          │                │ Failure          │ Success after timeout
          │         ┌──────▼───────┐         │
          │         │  🟡 Half-Open│─────────┘
