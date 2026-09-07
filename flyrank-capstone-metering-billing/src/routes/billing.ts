import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-08-26.dahlia'
});


// Calculate total token cost according to assignment rules
function calculateTokenCost(tokens: any) {
  const PRICE_INPUT_TOKENS = parseInt(process.env.PRICE_INPUT_TOKENS || '10'); // per 1000
  const PRICE_CACHED_INPUT_TOKENS = parseInt(process.env.PRICE_CACHED_INPUT_TOKENS || '5');
  const PRICE_OUTPUT_TOKENS = parseInt(process.env.PRICE_OUTPUT_TOKENS || '20');

  const inputCost = ((tokens.input || 0) / 1000) * PRICE_INPUT_TOKENS;
  const cachedInputCost = ((tokens.cachedInput || 0) / 1000) * PRICE_CACHED_INPUT_TOKENS;
  
  // Reasoning tokens count as output tokens
  const totalOutputTokens = (tokens.output || 0) + (tokens.reasoning || 0);
  const outputCost = (totalOutputTokens / 1000) * PRICE_OUTPUT_TOKENS;

  return Math.round(inputCost + cachedInputCost + outputCost); // Store money as integer cents
}

// Phase 2: POST /api/generate - Dummy Billable Endpoint
router.post('/generate', async (req, res) => {
  const prisma = (req as any).prisma as PrismaClient;
  const tenantId = req.headers['x-tenant-id'] as string;
  const idempotencyKey = req.headers['x-idempotency-key'] as string;
  const { tokens } = req.body; // e.g. { input: 100, output: 50, reasoning: 10 }

  if (!tenantId || !idempotencyKey) {
    return res.status(400).json({ error: 'Missing x-tenant-id or x-idempotency-key header' });
  }

  try {
    // 1. Quota Enforcement
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true }
    });

    if (!subscription) {
      return res.status(400).json({ error: 'Tenant has no active subscription' });
    }

    if (subscription.status !== 'active') {
      return res.status(402).json({ error: 'Payment required: Subscription is not active' });
    }

    const plan = subscription.plan;
    
    // Calculate current usage for the billing period
    const usageEvents = await prisma.usageEvent.findMany({
      where: {
        tenantId,
        timestamp: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd
        }
      }
    });

    let currentApiCalls = 0;
    let currentTokens = 0;

    for (const event of usageEvents) {
      if (event.type === 'api_call') {
        currentApiCalls += event.quantity;
      } else if (event.type === 'ai_token') {
        currentTokens += event.quantity;
      }
    }

    // Check if new request will exceed limits
    const requestedTokens = tokens ? (tokens.input || 0) + (tokens.cachedInput || 0) + (tokens.output || 0) + (tokens.reasoning || 0) : 0;

    if (currentApiCalls + 1 > plan.apiLimit) {
      return res.status(429).json({ error: 'Usage quota exceeded: API Call Limit reached' });
    }

    if (currentTokens + requestedTokens > plan.tokenLimit) {
      return res.status(429).json({ error: 'Usage quota exceeded: Token Limit reached' });
    }

    // 2. Metering (Idempotent exactly-once logic)
    // We try to insert the API call usage event and token usage event (if provided).
    // Using Prisma's create inside a try/catch handles the unique constraint error.

    try {
      await prisma.$transaction(async (tx: any) => {
        // Record API call
        await tx.usageEvent.create({
          data: {
            tenantId,
            idempotencyKey: `${idempotencyKey}-api`,
            type: 'api_call',
            quantity: 1
          }
        });

        // Record Tokens if any
        if (requestedTokens > 0) {
          await tx.usageEvent.create({
            data: {
              tenantId,
              idempotencyKey: `${idempotencyKey}-token`,
              type: 'ai_token',
              quantity: requestedTokens,
              metadata: tokens // save exact counts for cost rollup
            }
          });
        }
      });
    } catch (dbError: any) {
      // Prisma error code P2002 means Unique constraint failed (idempotency hit)
      if (dbError.code === 'P2002') {
        console.log(`Idempotency key ${idempotencyKey} already processed. Returning original success.`);
        // Return success since it was already processed
        return res.status(200).json({ status: 'success', message: 'Generated successfully (Cached due to idempotency)' });
      }
      throw dbError; // Rethrow other errors
    }

    // Successful processing
    res.status(200).json({ status: 'success', message: 'Generated successfully' });

  } catch (err: any) {
    console.error('Error in /generate:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Phase 4: GET /api/usage - Rollup of usage and cost
router.get('/usage', async (req, res) => {
  const prisma = (req as any).prisma as PrismaClient;
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true }
    });

    if (!subscription) {
      return res.status(400).json({ error: 'Tenant has no active subscription' });
    }

    const usageEvents = await prisma.usageEvent.findMany({
      where: {
        tenantId,
        timestamp: {
          gte: subscription.currentPeriodStart,
          lte: subscription.currentPeriodEnd
        }
      }
    });

    let currentApiCalls = 0;
    let currentTokens = 0;
    let totalCostCents = 0; // Cost in cents

    for (const event of usageEvents) {
      if (event.type === 'api_call') {
        currentApiCalls += event.quantity;
      } else if (event.type === 'ai_token') {
        currentTokens += event.quantity;
        const tokensData = event.metadata as any;
        if (tokensData) {
          totalCostCents += calculateTokenCost(tokensData);
        }
      }
    }

    res.json({
      used: {
        apiCalls: currentApiCalls,
        tokens: currentTokens
      },
      limit: {
        apiCalls: subscription.plan.apiLimit,
        tokens: subscription.plan.tokenLimit
      },
      costCents: totalCostCents
    });

  } catch (err: any) {
    console.error('Error in /usage:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Phase 3: POST /api/checkout - Create Stripe Checkout Session
router.post('/checkout', async (req, res) => {
  const tenantId = req.headers['x-tenant-id'] as string;

  if (!tenantId) {
    return res.status(400).json({ error: 'Missing x-tenant-id header' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PLAN_PRICE_ID, // Use test price ID from env
          quantity: 1,
        },
      ],
      mode: 'subscription',
      client_reference_id: tenantId, // Crucial: to know which tenant to upgrade in webhook
      success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/cancel`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
