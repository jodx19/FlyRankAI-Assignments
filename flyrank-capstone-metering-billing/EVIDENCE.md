# Evidence

## Probe 1: Idempotency
- Send POST `/api/generate` with `x-idempotency-key: probe1`.
- Expected: 200 OK.
- Send POST `/api/generate` with same `x-idempotency-key: probe1`.
- Expected: 200 OK (returns original success, exactly 1 DB record).

## Probe 2: Quota Limits
- Generate enough events to hit exact quota.
- Next request over quota returns `429 Too Many Requests` or `402 Payment Required`.

## Probe 3: Stripe Checkout
- Run `stripe trigger checkout.session.completed`.
- Database updates to Pro Plan.

## Probe 4: Security
- Send a forged webhook with bad `stripe-signature`.
- Expected: 400 Bad Request.

## Probe 5: Math Checks
- Cached input tokens are charged at half price compared to fresh input tokens.
- Reasoning tokens are treated as output tokens.
