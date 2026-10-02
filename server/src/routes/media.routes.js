import { Router } from 'express';
import { protect, optionalAuth } from '../middleware/auth.js';
import { validateQuery, validateParams, validateBody } from '../middleware/validate.js';
import { z } from 'zod';
import {
  listMedia,
  getMedia,
  uploadMedia,
  updateMedia,
  deleteMedia,
  mediaUploadMiddleware,
} from '../controllers/media.controller.js';

const idParam = z.object({ id: z.string().trim().min(1) });

export const mediaRouter = Router();

mediaRouter.get('/', optionalAuth, validateQuery(z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  folder: z.string().optional(),
  tags: z.string().optional(),
  includeInactive: z.string().optional(),
  sort: z.string().optional(),
})), listMedia);

mediaRouter.get('/:id', optionalAuth, validateParams(idParam), getMedia);

mediaRouter.post('/', protect, mediaUploadMiddleware, uploadMedia);

mediaRouter.patch('/:id', protect, validateParams(idParam), validateBody(z.object({
  alt: z.string().trim().max(300).optional(),
  caption: z.string().trim().max(500).optional(),
  folder: z.string().trim().lowercase().max(60).optional(),
  tags: z.array(z.string().trim().max(80)).optional(),
  active: z.boolean().optional(),
})), updateMedia);

mediaRouter.delete('/:id', protect, validateParams(idParam), deleteMedia);