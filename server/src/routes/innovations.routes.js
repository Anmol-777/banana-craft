import { Router } from 'express';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { z } from 'zod';
import {
  listInnovations,
  getInnovation,
  createInnovation,
  updateInnovation,
  deleteInnovation,
  reorderInnovations,
} from '../controllers/innovations.controller.js';

const idParam = z.object({ id: z.string().trim().min(1) });
const reorderSchema = z.object({
  items: z.array(z.object({ id: z.string().optional(), slug: z.string().optional(), order: z.number().int().min(0) })).min(1).max(500),
});

export const innovationsRouter = Router();

innovationsRouter.get('/', optionalAuth, validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  includeInactive: z.string().optional(),
  sort: z.string().optional(),
})), listInnovations);

innovationsRouter.get('/:id', optionalAuth, validateParams(idParam), getInnovation);

innovationsRouter.post('/', protect, validateBody(z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().toLowerCase().max(220).optional(),
  summary: z.string().trim().max(500).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(2048), alt: z.string().trim().max(300).optional(), caption: z.string().trim().max(500).optional() })).max(30).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), createInnovation);

innovationsRouter.patch('/:id', protect, validateParams(idParam), validateBody(z.object({
  name: z.string().trim().min(1).max(200).optional(),
  slug: z.string().trim().toLowerCase().max(220).optional(),
  summary: z.string().trim().max(500).optional(),
  body: z.string().trim().max(20000).optional(),
  image: z.string().trim().max(2048).optional(),
  imageAlt: z.string().trim().max(300).optional(),
  images: z.array(z.object({ url: z.string().trim().min(1).max(2048), alt: z.string().trim().max(300).optional(), caption: z.string().trim().max(500).optional() })).max(30).optional(),
  order: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})), updateInnovation);

innovationsRouter.delete('/:id', protect, validateParams(idParam), deleteInnovation);

innovationsRouter.post('/reorder', protect, validateBody(reorderSchema), reorderInnovations);