# Usage Metering & Billing Engine

This is a backend service for SaaS usage metering, quota enforcement, and cost calculation. It integrates with Stripe for subscription management (in test mode).

## Features
- **Idempotent Metering**: A billable action creates exactly one usage event, even under retries.
- **Quota Enforcement**: Usage is checked against the tenant's plan. Overages return `429` or `402`.
- **Cost Calculation**: Monthly usage is rolled up. AI tokens are priced accurately (cached vs fresh vs reasoning).
- **Stripe Integration**: Checkout sessions and webhooks (signature verified).

## Architecture
- **Language**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Docker), Prisma ORM

## Running the Project

### Prerequisites
1. Docker installed and running.
2. Node.js (v18+) and npm.
3. Stripe CLI installed.

### Setup
1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Setup `.env`:
   ```bash
   cp .env.example .env
   # Ensure you populate Stripe secrets from your test account
   ```

3. Start PostgreSQL with Docker:
   ```bash
   docker compose up -d
   ```

4. Push the Prisma Schema and seed the database:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. Start the server:
   ```bash
   npm run dev
   ```
   *(Ensure you have a `dev` script in `package.json` like `"dev": "nodemon src/index.ts"`)*

### Stripe Webhooks
In a new terminal, use the Stripe CLI to forward events to your local server:
```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```
Copy the webhook signing secret it prints out and add it to your `.env` as `STRIPE_WEBHOOK_SECRET`.

### Testing APIs
- **Generate API Call (Dummy endpoint)**
  ```bash
  curl -X POST http://localhost:3000/api/generate \
       -H "Content-Type: application/json" \
       -H "x-tenant-id: <SEED_TENANT_ID>" \
       -H "x-idempotency-key: unique-req-123" \
       -d '{"tokens": {"input": 1500, "cachedInput": 500, "output": 200, "reasoning": 50}}'
  ```
- **Check Usage Rollup**
  ```bash
  curl http://localhost:3000/api/usage -H "x-tenant-id: <SEED_TENANT_ID>"
  ```

## Limitations
- This is a simplified capstone project for demonstration purposes. 
- Real-world billing often requires Stripe Invoicing, Usage Records API, and Proration handling (which are stretch goals).
- There is only 1 seed tenant, and authentication is not implemented (we trust `x-tenant-id`).
