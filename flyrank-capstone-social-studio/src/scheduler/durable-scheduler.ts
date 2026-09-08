import { prisma } from '../db';
import { getPublisher } from '../services/publishers';

export async function processDueSlots(): Promise<void> {
  // Find all pending slots whose publish time is in the past
  const dueSlots = await prisma.scheduleSlot.findMany({
    where: {
      status: 'pending',
      publishAt: { lte: new Date() },
    },
    include: { variant: true }
  });

  for (const slot of dueSlots) {
    console.log(`[Scheduler] Processing slot ${slot.id} for variant ${slot.variantId}`);

    // Check idempotency: did we already succeed?
    const existingSuccess = await prisma.publishHistory.findFirst({
      where: {
        scheduleSlotId: slot.id,
        resultStatus: 'success'
      }
    });

    if (existingSuccess) {
      console.log(`[Scheduler] Slot ${slot.id} already succeeded. Skipping.`);
      await prisma.scheduleSlot.update({
        where: { id: slot.id },
        data: { status: 'published' }
      });
      continue;
    }

    try {
      const publisher = getPublisher(slot.variant.platform);
      
      // Attempt publish
      const response = await publisher.publish(slot.variant.content, slot.idempotencyKey);
      
      // Record success
      await prisma.publishHistory.create({
        data: {
          scheduleSlotId: slot.id,
          resultStatus: 'success',
          responseDetails: JSON.stringify(response)
        }
      });
      
      // Mark slot as published and variant as published
      await prisma.scheduleSlot.update({
        where: { id: slot.id },
        data: { status: 'published' }
      });
      await prisma.variant.update({
        where: { id: slot.variant.id },
        data: { status: 'published' }
      });
      
      console.log(`[Scheduler] Slot ${slot.id} published successfully.`);
    } catch (error: any) {
      console.error(`[Scheduler] Slot ${slot.id} failed:`, error.message);
      
      // Record failure
      await prisma.publishHistory.create({
        data: {
          scheduleSlotId: slot.id,
          resultStatus: 'failed',
          responseDetails: error.message || 'Unknown error'
        }
      });
      // Slot remains 'pending' for the next retry
    }
  }
}

export function startScheduler() {
  console.log('[Scheduler] Starting durable scheduler polling...');
  // Poll every 10 seconds
  setInterval(async () => {
    try {
      await processDueSlots();
    } catch (err) {
      console.error('[Scheduler] Error in scheduler loop:', err);
    }
  }, 10000);
}
