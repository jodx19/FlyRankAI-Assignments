import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

const statusSchema = z.object({
  status: z.enum(['draft', 'approved', 'rejected', 'published']),
});

// Update variant status
router.patch('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = statusSchema.parse(req.body);
    
    const variant = await prisma.variant.update({
      where: { id: id as string },
      data: { status: validated.status },
    });
    
    res.status(200).json(variant);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Update failed' });
  }
});

const scheduleSchema = z.object({
  publishAt: z.string().datetime(), // ISO datetime string
});

// Schedule an approved variant
router.post('/:id/schedule', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validated = scheduleSchema.parse(req.body);
    
    const variant = await prisma.variant.findUnique({ where: { id: id as string } });
    if (!variant) {
      res.status(404).json({ error: 'Variant not found' });
      return;
    }
    
    if (variant.status !== 'approved') {
      res.status(400).json({ error: 'Only approved variants can be scheduled' });
      return;
    }
    
    const publishAt = new Date(validated.publishAt);
    
    const scheduleSlot = await prisma.scheduleSlot.create({
      data: {
        variantId: id as string,
        publishAt,
        status: 'pending',
        idempotencyKey: uuidv4(), // generate idempotency key
      }
    });
    
    res.status(201).json(scheduleSlot);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Scheduling failed' });
  }
});

export default router;
