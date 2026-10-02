import { Router } from 'express';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';
import {
  listStorySections,
  getStorySection,
  createStorySection,
  updateStorySection,
  deleteStorySection,
  reorderStorySections,
} from '../controllers/story.controller.js';

const keyParam = z.object({ key: z.string().trim().min(1) });
const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().optional(), key: z.string().trim().toLowerCase().optional(), order: z.number().int().min(0) })).min(1).max(500),
});

export const storyRouter = Router();

storyRouter.get('/', optionalAuth, validateQuery(z.object({
  includeInactive: z.string().optional(),
})), listStorySections);

storyRouter.get('/:key', optionalAuth, validateParams(keyParam), getStorySection);

storyRouter.post('/', protect, validateBody(z.object({
  key: z.string().trim().toLowerCase().min(2).max(160).regex(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/),
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['image-left', 'image-right']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), createStorySection);

storyRouter.patch('/:key', protect, validateParams(keyParam), validateBody(z.object({
  title: z.string().trim().max(200).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  layout: z.enum(['image-left', 'image-right']).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), updateStorySection);

storyRouter.delete('/:key', protect, validateParams(keyParam), deleteStorySection);

storyRouter.post('/reorder', protect, validateBody(reorderSchema), reorderStorySections);