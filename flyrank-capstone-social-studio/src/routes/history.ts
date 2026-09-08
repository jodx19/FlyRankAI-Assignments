import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Get publish history (showing attempts)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const history = await prisma.publishHistory.findMany({
      orderBy: { attemptedAt: 'desc' },
      include: {
        scheduleSlot: {
          include: {
            variant: true
          }
        }
      }
    });
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
