import { Router } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-08-26.dahlia'
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

// We use express.raw({ type: 'application/json' }) for Stripe signature verification
import express from 'express';

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const prisma = (req as any).prisma as PrismaClient;
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(400).send('Webhook Error: Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // This must be the raw buffer
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: Stripe ensures at-least-once delivery. We should handle idempotency.
  // In a real system we might record the event.id in an EventLog table, but updating subscription state is naturally idempotent
  // if we just upsert or update the current state.
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // We pass the tenantId in client_reference_id during checkout
        const tenantId = session.client_reference_id;
        if (tenantId && session.subscription) {
          
          // Find the Pro Plan
          const proPlan = await prisma.plan.findUnique({ where: { name: 'Pro' } });
          
          if (proPlan) {
            // Update tenant's subscription to Pro plan
            await prisma.subscription.update({
              where: { tenantId },
              data: {
                planId: proPlan.id,
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                status: 'active',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
              }
            });
            console.log(`Upgraded tenant ${tenantId} to Pro plan.`);
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any; // Using any to bypass potential Stripe typing issues
        // Update subscription status in our DB
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // Find Free Plan to downgrade to
        const freePlan = await prisma.plan.findUnique({ where: { name: 'Free' } });
        
        if (freePlan) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              planId: freePlan.id,
              status: 'active', // they are active on the free plan now
              stripeSubscriptionId: null
            }
          });
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Success');
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Returning a 500 will tell Stripe to retry
    res.status(500).send('Internal Server Error');
  }
});

export default router;
