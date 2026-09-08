# Social Media Studio

A robust backend publishing system that converts a single blog post into a multi-platform social media campaign with manual review, constraint profiles, and idempotent, durable scheduling.

## Architecture
- **Ingestion**: Accepts post content and URLs.
- **Variant Generator**: Enforces constraint profiles (length, tone, hashtags) to generate platform-specific drafts.
- **Review Workflow**: Variants start as drafts and must be approved. Unapproved variants are blocked from scheduling.
- **Durable Scheduler**: A SQLite-backed background worker polls for due slots and guarantees exactly-once delivery using publish history records and idempotency keys.
- **Adapters**: Clean `SocialPublisher` interface with implementations for Telegram (real), MockX, and MockLinkedIn.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and configure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
3. `npx prisma migrate dev`
4. `npm run start`

## Limitations
- Telegram does not natively support idempotency keys via its Bot API, so idempotency is guaranteed by our durable scheduler checking `PublishHistory` before making the request.
- The variant generator currently uses static templates rather than an LLM to generate text, although the architecture supports plugging in an LLM easily.
