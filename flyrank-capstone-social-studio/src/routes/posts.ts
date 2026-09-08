import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { z } from 'zod';
import { generateVariants } from '../services/generator';

const router = Router();

const postSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  sourceUrl: z.string().url().optional(),
});

// Ingest a post
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validated = postSchema.parse(req.body);
    const post = await prisma.post.create({
      data: {
        content: validated.content,
        sourceUrl: validated.sourceUrl,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Generate variants for a post
router.post('/:id/variants/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await prisma.post.findUnique({ where: { id: id as string } });
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Call variant generator
    const variants = await generateVariants(post);
    res.status(200).json(variants);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Generation failed' });
  }
});

export default router;
